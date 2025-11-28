import { createSignal } from 'solid-js';
import { requestSimulation } from '../lib/sms-bridge';
import { getDashboard, createPlan } from '../lib/api-client';
import { dashboard, setDashboard, plan, setPlan, setLoading, setError } from '../store/dashboardStore';

export default function SimulationButtons() {
  const [simulating, setSimulating] = createSignal(false);
  const [buildingPlan, setBuildingPlan] = createSignal(false);

  const handleSimulateWeek = async () => {
    setSimulating(true);
    setLoading(true);
    setError(null);

    try {
      await requestSimulation('week_history', async () => {
        // Refresh dashboard after simulation
        const dashboardData = await getDashboard();
        setDashboard(dashboardData);
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to simulate week');
      console.error('Error simulating week:', error);
    } finally {
      setSimulating(false);
      setLoading(false);
    }
  };

  const handleBuildPlan = async () => {
    setBuildingPlan(true);
    setLoading(true);
    setError(null);

    try {
      const planData = await createPlan('initial_plan');
      setPlan(planData);
      // Also refresh dashboard to get latest data
      const dashboardData = await getDashboard();
      setDashboard(dashboardData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to build plan');
      console.error('Error building plan:', error);
    } finally {
      setBuildingPlan(false);
      setLoading(false);
    }
  };

  const handleSimulateRepair = async () => {
    setSimulating(true);
    setLoading(true);
    setError(null);

    try {
      await requestSimulation('big_repair', async () => {
        // Refresh dashboard and create adjusted plan
        const dashboardData = await getDashboard();
        setDashboard(dashboardData);

        // Create risk-adjusted plan
        const planData = await createPlan('risk_adjustment');
        setPlan(planData);
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to simulate repair');
      console.error('Error simulating repair:', error);
    } finally {
      setSimulating(false);
      setLoading(false);
    }
  };

  return (
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Simulation Actions</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={handleSimulateWeek}
          disabled={simulating() || buildingPlan()}
          class="px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {simulating() ? 'Simulating...' : 'Simulate last 7 days'}
        </button>

        <button
          onClick={handleBuildPlan}
          disabled={simulating() || buildingPlan()}
          class="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {buildingPlan() ? 'Building...' : 'Build my plan'}
        </button>

        <button
          onClick={handleSimulateRepair}
          disabled={simulating() || buildingPlan()}
          class="px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {simulating() ? 'Simulating...' : 'Simulate big repair ₹1800'}
        </button>
      </div>
    </div>
  );
}

