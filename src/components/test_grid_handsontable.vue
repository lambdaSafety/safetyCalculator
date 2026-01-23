<template>
  <div class="safety-analysis-container">
    <h3>MTTF 계산기 (Safety Analysis Tool)</h3>
    <div id="hot-container"></div>
    <p class="hint">* λ(Failure Rate)를 입력하면 MTTF가 자동으로 계산됩니다.</p>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';

export default {
  name: 'SafetyCalc',
  setup() {
    let hot = null;

    onMounted(() => {
      const container = document.getElementById('hot-container');
      
      const data = [
        ['λ (Failure Rate)', 0], // A1, B1
        ['MTTF (Mean Time)', 0]  // A2, B2
      ];

      hot = new Handsontable(container, {
        data: data,
        colHeaders: ['Property', 'Value'],
        rowHeaders: true,
        height: 'auto',
        licenseKey: 'non-commercial-and-evaluation', // 자기계발용 설정
        
        // 셀 스타일링 및 속성 제어
        cells(row, col) {
          const cellProperties = {};
          // A열 (라벨) 스타일링
          if (col === 0) {
            cellProperties.readOnly = true;
            cellProperties.className = 'label-cell';
          }
          // B2 (MTTF 결과값)는 읽기 전용
          if (row === 1 && col === 1) {
            cellProperties.readOnly = true;
          }
          return cellProperties;
        },

        // 데이터 변경 감지 (계산 로직)
        afterChange(changes) {
          if (!changes) return;
          
          changes.forEach(([row, col, oldValue, newValue]) => {
            // B1(λ) 값이 변경되었을 때 실행
            if (row === 0 && col === 1) {
              const lambda = parseFloat(newValue);
              let mttf = 0;
              
              if (lambda > 0) {
                mttf = 1 / lambda; // 수식: MTTF = 1/λ
              }
              
              // B2에 결과값 세팅 (render 방지를 위해 소스 구분)
              hot.setDataAtCell(1, 1, mttf.toFixed(2), 'calc_engine');
            }
          });
        }
      });
    });

    return {};
  }
}
</script>

<style scoped>
.safety-analysis-container {
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 녹색 라벨 (A1, A2) */
:deep(.label-cell) {
  background-color: #2ecc71 !important;
  color: white !important;
  font-weight: bold;
  text-align: center;
}

/* 입력창 및 결과창 (B1, B2) - 흰색 배경 */
:deep(.htCore td:nth-child(2)) {
  background-color: #ffffff;
  text-align: right;
}

.hint {
  margin-top: 10px;
  font-size: 0.85rem;
  color: #666;
}
</style>