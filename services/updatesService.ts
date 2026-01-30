import {
    collection,
    doc,
    getDocs,
    addDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { CityUpdate, UpdateCategory, Coordinates } from '../types';

// Collection reference
const UPDATES_COLLECTION = 'updates';

// Interface for creating new updates
interface CreateUpdateData {
    category: UpdateCategory;
    description: string;
    location: Coordinates;
    authorId: string;
    expiresInHours?: number; // Default 2 hours
}

/**
 * Create a new update in Firestore
 */
export const createUpdate = async (data: CreateUpdateData): Promise<CityUpdate> => {
    try {
        const now = Date.now();
        const expiresInMs = (data.expiresInHours || 2) * 60 * 60 * 1000;

        const updateData = {
            category: data.category,
            description: data.description,
            location: data.location,
            authorId: data.authorId,
            timestamp: now,
            expiresAt: now + expiresInMs,
            likes: 0,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, UPDATES_COLLECTION), updateData);

        return {
            id: docRef.id,
            ...updateData,
        } as CityUpdate;
    } catch (error) {
        console.error('Error creating update:', error);
        throw error;
    }
};

/**
 * Get all active (non-expired) updates
 */
export const getActiveUpdates = async (): Promise<CityUpdate[]> => {
    try {
        const now = Date.now();

        // Query for non-expired updates, ordered by timestamp
        const q = query(
            collection(db, UPDATES_COLLECTION),
            where('expiresAt', '>', now),
            orderBy('expiresAt'),
            orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as CityUpdate[];
    } catch (error) {
        console.error('Error fetching updates:', error);
        throw error;
    }
};

/**
 * Get updates near a specific location
 * Note: Firestore doesn't support native geo-queries, so we fetch all active
 * and filter client-side. For production, consider using Geohash or GeoFirestore.
 */
export const getNearbyUpdates = async (
    center: Coordinates,
    radiusKm: number = 20
): Promise<CityUpdate[]> => {
    try {
        const allUpdates = await getActiveUpdates();

        // Filter by distance client-side
        return allUpdates.filter(update => {
            const distance = getDistanceFromLatLonInKm(
                center.lat,
                center.lng,
                update.location.lat,
                update.location.lng
            );
            return distance <= radiusKm;
        });
    } catch (error) {
        console.error('Error fetching nearby updates:', error);
        throw error;
    }
};

/**
 * Delete an update by ID
 */
export const deleteUpdate = async (updateId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, UPDATES_COLLECTION, updateId));
    } catch (error) {
        console.error('Error deleting update:', error);
        throw error;
    }
};

/**
 * Delete all expired updates (cleanup function)
 * Can be called periodically or triggered by Cloud Functions
 */
export const deleteExpiredUpdates = async (): Promise<number> => {
    try {
        const now = Date.now();

        const q = query(
            collection(db, UPDATES_COLLECTION),
            where('expiresAt', '<=', now)
        );

        const snapshot = await getDocs(q);

        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        return snapshot.size;
    } catch (error) {
        console.error('Error deleting expired updates:', error);
        throw error;
    }
};

// Helper: Haversine formula for distance calculation
const getDistanceFromLatLonInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
