import React from 'react';
import { useQuery } from 'react-query';

const AnalysisPage = () => {
  // Fetch logic with refetchInterval
  const { data, error, isLoading } = useQuery('analysis', fetchAnalysisData, {
    refetchInterval: 5000, // Specify your desired refetch interval here (in milliseconds)
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{JSON.stringify(data)}</div>;
};

export default AnalysisPage;