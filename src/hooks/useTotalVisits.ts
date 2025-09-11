import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTotalVisits = () => {
  const [uniqueVisitsToday, setUniqueVisitsToday] = useState<number>(0);
  const [totalUniqueVisitors, setTotalUniqueVisitors] = useState<number>(0);
  const [totalDailyUniqueVisits, setTotalDailyUniqueVisits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get or create visitor ID
    const getVisitorId = () => {
      let visitorId = localStorage.getItem('flameiptv_visitor_id');
      if (!visitorId) {
        visitorId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('flameiptv_visitor_id', visitorId);
      }
      return visitorId;
    };

    // Track this visit (unique per day)
    const trackVisit = async () => {
      try {
        const visitorId = getVisitorId();
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        console.log('Tracking visit for visitor:', visitorId, 'date:', today);

        // Check if this visitor already visited today
        const { data: existingVisit, error: checkError } = await supabase
          .from('visits')
          .select('id')
          .eq('visitor_id', visitorId)
          .eq('visit_date', today)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing visit:', checkError);
        }

        console.log('Existing visit found:', !!existingVisit);

        // Only insert if no visit today
        if (!existingVisit) {
          console.log('Inserting new visit...');
          const { error } = await supabase
            .from('visits')
            .insert([{
              visitor_id: visitorId,
              ip_address: null, // We don't collect IP for privacy
              user_agent: navigator.userAgent,
              page_path: window.location.pathname,
              visit_date: today,
            }]);
          
          if (error) {
            console.error('Error tracking visit:', error);
          } else {
            console.log('Visit tracked successfully');
          }
        } else {
          console.log('Visit already exists for today, skipping insert');
        }
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    };

    // Fetch unique visits today and total unique visitors
    const fetchVisitStats = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get unique visits today
        const { count: todayCount, error: todayError } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .eq('visit_date', today);
        
        if (todayError) {
          console.error('Error fetching unique visits today:', todayError);
        } else {
          setUniqueVisitsToday(todayCount || 0);
        }

        // Get total unique visitors (distinct visitor_id count across all time)
        const { data: uniqueVisitors, error: totalError } = await supabase
          .from('visits')
          .select('visitor_id')
          .not('visitor_id', 'is', null);
        
        if (totalError) {
          console.error('Error fetching total unique visitors:', totalError);
        } else {
          // Count unique visitor_ids across all time
          const uniqueCount = new Set(uniqueVisitors?.map(v => v.visitor_id)).size;
          setTotalUniqueVisitors(uniqueCount);
        }

        // Get total daily unique visits (unique visitor per day across all time)
        const { data: allVisits, error: dailyError } = await supabase
          .from('visits')
          .select('visitor_id, visit_date')
          .not('visitor_id', 'is', null);
        if (dailyError) {
          console.error('Error fetching total daily unique visits:', dailyError);
        } else {
          const pairSet = new Set(
            (allVisits || []).map(v => `${v.visitor_id}|${v.visit_date}`)
          );
          setTotalDailyUniqueVisits(pairSet.size);
        }
      } catch (error) {
        console.error('Error fetching visit stats:', error);
      } finally {
        setLoading(false);
      }
    };

    // Track visit first, then fetch stats
    trackVisit().then(() => {
      // Small delay to ensure the visit is recorded before counting
      setTimeout(fetchVisitStats, 500);
    });
  }, []);

  return { uniqueVisitsToday, totalUniqueVisitors, totalDailyUniqueVisits, loading };
};