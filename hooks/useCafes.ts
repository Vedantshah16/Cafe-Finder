'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import type { Cafe, CafeSearchParams } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import toast from 'react-hot-toast';

export function useCafes() {
  const { setCafes, setIsLoading, userLocation } = useAppStore();
  const [error, setError] = useState<string | null>(null);

  const searchCafes = useCallback(
    async (params: CafeSearchParams): Promise<Cafe[]> => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await axios.get('/api/cafes/search', { params });
        const cafes: Cafe[] = data.data || [];
        setCafes(cafes);
        return cafes;
      } catch (err) {
        const msg = 'Failed to find cafes. Please try again.';
        setError(msg);
        toast.error(msg);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [setCafes, setIsLoading]
  );

  const fetchNearbyCafes = useCallback(
    async (lat?: number, lng?: number, radius = 1500): Promise<Cafe[]> => {
      const coords = {
        lat: lat ?? userLocation?.lat,
        lng: lng ?? userLocation?.lng,
      };
      if (!coords.lat || !coords.lng) return [];

      setIsLoading(true);
      setError(null);
      try {
        const { data } = await axios.get('/api/cafes/nearby', {
          params: { lat: coords.lat, lng: coords.lng, radius },
        });
        const cafes: Cafe[] = data.data || [];
        setCafes(cafes);
        return cafes;
      } catch {
        setError('Failed to load nearby cafes.');
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [setCafes, setIsLoading, userLocation]
  );

  const fetchCafeDetails = useCallback(async (placeId: string): Promise<Cafe | null> => {
    try {
      const { data } = await axios.get(`/api/cafes/${placeId}`);
      return data.data;
    } catch {
      toast.error('Failed to load cafe details.');
      return null;
    }
  }, []);

  const getAIRecommendations = useCallback(
    async (query: string): Promise<Cafe[]> => {
      setIsLoading(true);
      try {
        const { data } = await axios.post('/api/ai/recommend', {
          query,
          location: userLocation,
        });
        const cafes: Cafe[] = data.data?.cafes || [];
        setCafes(cafes);
        return cafes;
      } catch {
        toast.error('AI recommendations unavailable.');
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [setCafes, setIsLoading, userLocation]
  );

  return { searchCafes, fetchNearbyCafes, fetchCafeDetails, getAIRecommendations, error };
}
