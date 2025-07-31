import Dashboard from './Dashboard';
import { ESPConnectionTest } from '@/components/ESPConnectionTest';

const Index = () => {
  // Uncomment the line below to show ESP test instead of full dashboard
  // return <ESPConnectionTest />;
  return <Dashboard />;
};

export default Index;
