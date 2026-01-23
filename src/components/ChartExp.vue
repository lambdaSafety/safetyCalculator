<template>
  <div class="chart-container">
    <h2>지수분포 상세 분석 (f, F, R)</h2>
    
    <div class="controls">
      <div class="control-group">
        <label>Mission Time ($t$): <strong>{{ missionTime.toLocaleString() }}</strong> h</label>
        <input type="range" v-model.number="missionTime" min="0" max="200000" step="1000" class="slider" />
      </div>
      
      <div class="control-group">
        <label>Failure Rate ($\lambda$): <strong>{{ lambda.toExponential(2) }}</strong></label>
        <div class="lambda-slider-wrapper">
          <span class="range-label">10^-9</span>
          <input type="range" v-model.number="lambdaExponent" min="-9" max="-1" step="0.1" class="slider" />
          <span class="range-label">10^-1</span>
        </div>
      </div>
    </div>

    <div class="canvas-wrapper">
      <Line v-if="isChartReady" :data="chartData" :options="chartOptions" />
    </div>

    <div class="formula-info">
      <span style="color: #f87979">● f(t): 고장 발생 확률 밀도 (오른쪽 축)</span>
      <span style="color: #3498db">● F(t): 누적 고장 확률</span>
      <span style="color: #2ecc71">● R(t): 신뢰도 (생존 확률)</span>
    </div>
  </div>
</template>

<script setup>
// 1. Vue 및 외부 라이브러리 임포트
import { ref, computed, onMounted } from 'vue';
import { Line } from 'vue-chartjs'; // Chart.js의 Line 차트 컴포넌트
import {
  Chart as ChartJS, Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, Filler
} from 'chart.js';

// 2. Chart.js 플러그인 및 모듈 등록 (차트 기능을 활성화하기 위해 필수)
ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, Filler);

// 3. 반응형 상태(State) 정의
const isChartReady = ref(false); // 컴포넌트 마운트 후 차트 렌더링 여부를 결정하는 플래그
const missionTime = ref(200000); // 분석 대상이 되는 총 미션 시간 (기본값: 20만 시간)
const lambdaExponent = ref(-5);  // 고장률(lambda)의 지수 값 (스케일 조정을 위한 슬라이더용 값)

// 4. 계산된 속성 (Computed Properties)
// lambdaExponent가 변할 때마다 실제 고장률 lambda(λ)를 계산 (예: 10^-5)
const lambda = computed(() => Math.pow(10, lambdaExponent.value));

// 컴포넌트가 화면에 붙었을(마운트) 때 차트 준비 완료 상태로 변경
onMounted(() => { isChartReady.value = true; });

// 5. 차트에 사용될 데이터 생성 로직
const chartData = computed(() => {
  const labels = [];  // X축 레이블 (시간 흐름)
  const pdfData = []; // f(t) 데이터 저장 배열
  const cdfData = []; // F(t) 데이터 저장 배열
  const relData = []; // R(t) 데이터 저장 배열
  
  const steps = 100; // 차트를 그릴 데이터 포인트 개수 (해상도)
  for (let i = 0; i <= steps; i++) {
    // 0부터 missionTime까지 100단계로 나누어 시간(t) 계산
    const t = (missionTime.value / steps) * i;
    labels.push(t.toFixed(0)); // 소수점 제거 후 X축에 추가
    
    const l = lambda.value;
    
    // 신뢰성 공학 수식 적용
    const pdf = l * Math.exp(-l * t); // 확률밀도함수(PDF): f(t) = λe^(-λt)
    const cdf = 1 - Math.exp(-l * t); // 누적분포함수(CDF): F(t) = 1 - e^(-λt)
    const rel = Math.exp(-l * t);     // 신뢰도함수(Reliability): R(t) = e^(-λt)
    
    pdfData.push(pdf);
    cdfData.push(cdf);
    relData.push(rel);
  }

  return {
    labels,
    datasets: [
      {
        label: 'f(t) - PDF', // 확률 밀도 함수
        borderColor: '#f87979',
        backgroundColor: 'rgba(248, 121, 121, 0.1)',
        data: pdfData,
        yAxisID: 'y_pdf', // 수치가 매우 작으므로 오른쪽 보조 축(y_pdf)에 연결
        pointRadius: 0,
        fill: true // 선 아래 영역 채우기 활성화
      },
      {
        label: 'F(t) - CDF', // 고장 누적 확률
        borderColor: '#3498db',
        data: cdfData,
        yAxisID: 'y_prob', // 0~1 사이 값이므로 왼쪽 주 축(y_prob)에 연결
        pointRadius: 0
      },
      {
        label: 'R(t) - Reliability', // 신뢰도 (생존 확률)
        borderColor: '#2ecc71',
        data: relData,
        yAxisID: 'y_prob', // 0~1 사이 값이므로 왼쪽 주 축(y_prob)에 연결
        pointRadius: 0
      }
    ]
  };
});

// 6. 차트 옵션 설정 (축 스타일, 레이아웃 등)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // 컨테이너 크기에 맞춰 높이 조절 허용
  scales: {
    // 왼쪽 Y축: 확률 값 (0에서 1 사이)
    y_prob: {
      type: 'linear',
      display: true,
      position: 'left',
      min: 0,
      max: 1,
      title: { display: true, text: 'F(t), R(t) 확률 (0~1)' }
    },
    // 오른쪽 Y축: PDF 값 (고장률 λ에 따라 매우 작은 소수점일 수 있음)
    y_pdf: {
      type: 'linear',
      display: true,
      position: 'right',
      grid: { drawOnChartArea: false }, // 왼쪽 축의 격자와 겹치지 않게 설정
      title: { display: true, text: 'f(t) 확률 밀도' }
    },
    // X축: 시간(Hours)
    x: {
      title: { display: true, text: 'Time (hours)' },
      ticks: { maxTicksLimit: 10 } // 레이블이 너무 촘촘하지 않게 최대 10개로 제한
    }
  }
};
</script>



<style scoped>
.chart-container { padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.controls { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
.canvas-wrapper { height: 500px; margin-bottom: 15px; }
.formula-info { display: flex; justify-content: space-around; font-size: 0.85rem; font-weight: bold; padding: 10px; background: #eee; border-radius: 5px; }


.control-group { display: flex; flex-direction: column; gap: 10px; }
.lambda-slider-wrapper { display: flex; align-items: center; gap: 10px; }
.slider { width: 100%; cursor: pointer; }



</style>