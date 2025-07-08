import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { extractVideoId, fetchVideoViewCount, calculateViewsGained } from '@/utils/youtube';
import { useToast } from '@/hooks/use-toast';

export const useYouTubeTracking = (campaigns: any[]) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateCampaignViewCounts = useCallback(async () => {
    if (campaigns.length === 0) return;
    
    setIsUpdating(true);
    console.log('Starting YouTube view count update...');
    
    try {
      // Only update active campaigns
      const activeCampaigns = campaigns.filter(c => c.status === 'active');
      console.log('Active campaigns to update:', activeCampaigns.length);
      
      for (const campaign of activeCampaigns) {
        console.log('Processing campaign:', campaign.title);
        const videoId = extractVideoId(campaign.youtube_video_url);
        console.log('Extracted video ID:', videoId);
        
        if (!videoId) {
          console.log('No video ID found, skipping campaign');
          continue;
        }
        
        const currentViews = await fetchVideoViewCount(videoId);
        console.log('Current views fetched:', currentViews);
        
        if (currentViews === null) {
          console.log('Failed to fetch views, skipping campaign');
          continue;
        }
        
        // If starting_views is 0, set it to current views (first time tracking)
        let startingViews = campaign.starting_views || 0;
        if (startingViews === 0) {
          startingViews = currentViews;
          console.log('Setting starting views to current views:', startingViews);
        }
        
        const viewsGained = calculateViewsGained(currentViews, startingViews);
        console.log('Views gained:', viewsGained, 'Target:', campaign.target_views);
        
        // Determine if campaign should be completed
        const shouldComplete = viewsGained >= campaign.target_views;
        const newStatus = shouldComplete ? 'completed' : campaign.status;
        
        console.log('Updating campaign in database...');
        // Update campaign in database
        const { error } = await supabase
          .from('campaigns')
          .update({
            current_views: currentViews,
            starting_views: startingViews,
            status: newStatus,
            last_view_update: new Date().toISOString()
          })
          .eq('id', campaign.id);
        
        if (error) {
          console.error('Error updating campaign:', error);
          continue;
        }
        
        console.log('Campaign updated successfully');
        
        // Show completion notification
        if (shouldComplete && campaign.status !== 'completed') {
          toast({
            title: "Campaign Completed! 🎉",
            description: `"${campaign.title}" has reached its target views!`,
          });
        }
      }
    } catch (error) {
      console.error('Error updating view counts:', error);
    } finally {
      setIsUpdating(false);
      console.log('YouTube view count update finished');
    }
  }, [campaigns, toast]);

  // Auto-update every 30 seconds for active campaigns (reduced from 60 seconds)
  useEffect(() => {
    const hasActiveCampaigns = campaigns.some(c => c.status === 'active');
    if (!hasActiveCampaigns) return;
    
    console.log('Setting up YouTube tracking for active campaigns');
    
    // Initial update
    updateCampaignViewCounts();
    
    // Set up interval
    const interval = setInterval(updateCampaignViewCounts, 30000); // 30 seconds
    
    return () => {
      console.log('Cleaning up YouTube tracking interval');
      clearInterval(interval);
    };
  }, [updateCampaignViewCounts, campaigns]);

  return {
    isUpdating,
    updateCampaignViewCounts
  };
};