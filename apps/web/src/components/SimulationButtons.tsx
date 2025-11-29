import { createSignal } from 'solid-js';
import { requestSimulation } from '../lib/sms-bridge';
import { createPlan } from '../lib/api-client';
import { setPlan, setLoading, setError, handleDashboardRefresh } from '../store/dashboardStore';

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
        await handleDashboardRefresh();
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
      await handleDashboardRefresh();
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
      // Store the current spendTotal to detect when it changes
      const { dashboard } = await import('../store/dashboardStore');
      const initialSpendTotal = dashboard()?.spendTotal || 0;
      
      await requestSimulation('big_repair');
      
      // Wait for handleSmsEvents to process and refresh
      // Poll until data is updated (check if spendTotal changed)
      let attempts = 0;
      const maxAttempts = 15; // 7.5 seconds max wait (15 * 500ms)
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await handleDashboardRefresh();
        const currentSpendTotal = dashboard()?.spendTotal || 0;
        // If spendTotal changed, the repair transaction was processed
        if (currentSpendTotal !== initialSpendTotal) {
          break;
        }
        attempts++;
      }

      // Create risk-adjusted plan after dashboard is updated
      const planData = await createPlan('risk_adjustment');
      setPlan(planData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to simulate repair');
      console.error('Error simulating repair:', error);
    } finally {
      setSimulating(false);
      setLoading(false);
    }
  };

  return (
    <div class="mt-4 inline-flex flex-wrap gap-2 rounded-2xl bg-slate-900/90 border border-slate-700 px-2 py-2 backdrop-blur shadow-[0_18px_45px_rgba(15,23,42,0.85)]">
      {/* <button
        onClick={handleSimulateWeek}
        disabled={simulating() || buildingPlan()}
        class="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-[#f97316] to-[#ec4899] shadow-lg shadow-orange-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {simulating() ? 'Simulating...' : 'Simulate last 7 days'}
      </button> */}

      <button
        onClick={handleBuildPlan}
        disabled={simulating() || buildingPlan()}
        class="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-100 bg-white/5 border border-white/15 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {buildingPlan() ? 'Building...' : 'Build my plan'}
      </button>

      <button
        onClick={handleSimulateRepair}
        disabled={simulating() || buildingPlan()}
        class="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-orange-200 bg-[#1f2937] border border-orange-400/60 hover:bg-[#111827] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {simulating() ? 'Simulating...' : 'Simulate big repair ₹1800'}
      </button>
    </div>
  );
}

