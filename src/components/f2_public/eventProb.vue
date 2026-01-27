<template>
  <div class="chart-container">
    <h2>Event Probability Analysis (Safety Engineering)</h2>
    
    <div class="control-section">
      <label class="section-title">Exp. Dist. Type</label>
      <div class="radio-group">
        <label><input type="radio" v-model="distType" value="option1" /> Exp. dist. (P(E) = 1-exp(-λt))</label>
        <label><input type="radio" v-model="distType" value="option2" /> Exp. dist. (repairable events)</label>
        <label><input type="radio" v-model="distType" value="option3" /> Exp. dist. (monitored events)</label>
      </div>
    </div>

    <div class="controls grid-layout">
      <div class="control-group">
        <label>Mission Time ($t$)</label>
        <input type="number" v-model.number="t" class="input-field" />
      </div>
      <div class="control-group">
        <label>Failure Rate ($\lambda$)</label>
        <input type="number" v-model.number="lambda" step="0.000001" class="input-field" />
      </div>
      <div class="control-group readonly">
        <label>FIT ($\lambda \times 10^9$)</label>
        <input type="text" :value="fitValue" readonly class="input-field gray" />
      </div>

      <template v-if="distType === 'option2'">
        <div class="control-group">
          <label>MTTR (h)</label>
          <input type="number" v-model.number="mttr" class="input-field" />
        </div>
        <div class="control-group readonly">
          <label>$\mu$ (1/MTTR)</label>
          <input type="text" :value="mu.toFixed(4)" readonly class="input-field gray" />
        </div>
      </template>

      <template v-if="distType === 'option3'">
        <div class="control-group">
          <label>Monitoring Interval</label>
          <input type="number" v-model.number="interval" class="input-field" />
        </div>
        <div class="control-group readonly">
          <label>$\tau$ (Unit: h)</label>
          <input type="text" :value="tau" readonly class="input-field gray" />
        </div>
        <div class="control-group readonly">
          <label>mod($t, \tau$)</label>
          <input type="text" :value="modT" readonly class="input-field gray" />
        </div>
      </template>
    </div>

    <div class="results-display">
      <div class="result-item">
        <span class="res-label">P = F(t):</span>
        <span class="res-value color-p">{{ formattedP }}</span>
      </div>
      <div class="result-item">
        <span class="res-label">R(t):</span>
        <span class="res-value color-r">{{ formattedR }}</span>
      </div>
      <div class="result-item">
        <span class="res-label">f = f(t):</span>
        <span class="res-value color-f">{{ formattedF }}</span>
      </div>
    </div>

    <div class="canvas-wrapper">
      <Line v-if="isChartReady" :data="chartData" :options="chartOptions" />
    </div>

    <div class="formula-info">
      <span><strong style="color: #e74c3c">―</strong> P (F(t))</span>
      <span><strong style="color: #3498db">―</strong> f(t)</span>
      <span><strong style="color: #2ecc71">―</strong> Mission Time (t)</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS, Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, Filler
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, Filler);

// 시스템 설정값
const precision = 20;

// 상태 정의
const isChartReady = ref(false);
const distType = ref('option1');
const t = ref(4000);
const lambda = ref(0.00001);
const mttr = ref(2);
const interval = ref(1500);

onMounted(() => { isChartReady.value = true; });

// --- 기초 계산 로직 ---
const fitValue = computed(() => (lambda.value * Math.pow(10, 9)).toFixed(2));
const mu = computed(() => mttr.value > 0 ? 1 / mttr.value : 0);
const tau = computed(() => interval.value);

const modT = computed(() => {
  const currentT = t.value;
  const currentTau = tau.value;
  if (currentTau === 0) return 0;
  if (currentT <= currentTau) return currentT;
  return (currentT - currentTau) % currentTau;
});

// --- 핵심 수식 계산 (P, R, f) ---
const calculation = computed(() => {
  const l = lambda.value;
  const m = mu.value;
  const time = t.value;
  const mt = modT.value;
  let pVal = 0;

  if (distType.value === 'option1') {
    pVal = 1 - Math.exp(-l * time);
  } else if (distType.value === 'option2') {
    pVal = (l / (l + m)) * (1 - Math.exp(-1 * (l + m) * time));
  } else if (distType.value === 'option3') {
    pVal = 1 - Math.exp(-l * mt);
  }

  const P = Number(pVal.toFixed(precision));
  const R = Number((1 - P).toFixed(precision));
  const f = Number((R * l).toFixed(precision));

  return { P, R, f };
});

// 포맷팅 (지수 표기법, 소수점 10자리)
const formatExp = (num) => num.toExponential(10).toUpperCase();
const formattedP = computed(() => formatExp(calculation.value.P));
const formattedR = computed(() => formatExp(calculation.value.R));
const formattedF = computed(() => formatExp(calculation.value.f));

// --- 차트 데이터 생성 ---
const chartData = computed(() => {
  const labels = [];
  const pSeries = [];
  const fSeries = [];
  const tLine = [];

  const maxRange = t.value * 1.5; // 미션 시간의 1.5배까지 보여줌
  const steps = 50;
  
  for (let i = 0; i <= steps; i++) {
    const curX = (maxRange / steps) * i;
    labels.push(curX.toFixed(0));
    
    // 차트용 수식 재계산 (x축 변화에 따른 데이터)
    let curP = 0;
    const l = lambda.value;
    if (distType.value === 'option1') {
      curP = 1 - Math.exp(-l * curX);
    } else if (distType.value === 'option2') {
      const m = mu.value;
      curP = (l / (l + m)) * (1 - Math.exp(-1 * (l + m) * curX));
    } else if (distType.value === 'option3') {
      const curModT = curX <= tau.value ? curX : (curX - tau.value) % tau.value;
      curP = 1 - Math.exp(-l * curModT);
    }

    pSeries.push(curP);
    fSeries.push((1 - curP) * l); // f(t) = R(t) * lambda
    
    // 미션 시간 수직선 (현재 t와 가장 가까운 지점에서 Y축 끝까지)
    tLine.push(null); 
  }

  return {
    labels,
    datasets: [
      {
        label: 'P = F(t)',
        borderColor: '#e74c3c',
        data: pSeries,
        yAxisID: 'y1',
        pointRadius: 0,
      },
      {
        label: 'f = f(t)',
        borderColor: '#3498db',
        data: fSeries,
        yAxisID: 'y2',
        pointRadius: 0,
      },
      {
        label: 'Mission Time',
        borderColor: '#2ecc71',
        borderWidth: 2,
        borderDash: [5, 5],
        data: labels.map((label) => Math.abs(label - t.value) < (maxRange/steps/2) ? 1 : null),
        yAxisID: 'y_vertical',
        pointRadius: 0,
        fill: false,
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y1: { type: 'linear', position: 'left', title: { display: true, text: 'Probability P' }, min: 0 },
    y2: { type: 'linear', position: 'right', title: { display: true, text: 'Density f(t)' }, grid: { drawOnChartArea: false } },
    y_vertical: { display: false, min: 0, max: 1 },
    x: { title: { display: true, text: 'Time (h)' } }
  },
  plugins: {
    legend: { display: false }
  }
};
</script>

<style scoped>
.chart-container { padding: 25px; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); max-width: 1000px; margin: auto; }
h2 { color: #2c3e50; margin-bottom: 25px; text-align: center; font-weight: 700; }

.section-title { font-weight: bold; display: block; margin-bottom: 10px; color: #34495e; }
.radio-group { display: flex; gap: 15px; margin-bottom: 25px; background: #f1f3f5; padding: 15px; border-radius: 8px; flex-wrap: wrap; }

.grid-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
.control-group { display: flex; flex-direction: column; gap: 5px; }
.control-group label { font-size: 0.85rem; color: #7f8c8d; }

.input-field { padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; }
.gray { background-color: #f8f9fa; color: #636e72; }

.results-display { display: flex; justify-content: space-around; background: #2c3e50; color: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; }
.result-item { text-align: center; }
.res-label { display: block; font-size: 0.9rem; margin-bottom: 5px; color: #bdc3c7; }
.res-value { font-family: 'Courier New', Courier, monospace; font-size: 1.1rem; font-weight: bold; }
.color-p { color: #ff7675; }
.color-r { color: #55efc4; }
.color-f { color: #74b9ff; }

.canvas-wrapper { height: 400px; margin-top: 20px; }
.formula-info { display: flex; justify-content: center; gap: 30px; margin-top: 20px; font-size: 0.9rem; }
</style>