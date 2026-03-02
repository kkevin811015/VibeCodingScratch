/**
 * Lotto Generator Web Component
 */
class LottoGenerator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.numbers = [];
    this.isGenerating = false;
  }

  connectedCallback() {
    this.render();
  }

  generateNumbers() {
    if (this.isGenerating) return;
    this.isGenerating = true;
    
    // Clear existing
    this.numbers = [];
    this.render();

    const newNumbers = [];
    while (newNumbers.length < 6) {
      const r = Math.floor(Math.random() * 45) + 1;
      if (newNumbers.indexOf(r) === -1) newNumbers.push(r);
    }
    newNumbers.sort((a, b) => a - b);

    // Animate reveal
    newNumbers.forEach((num, index) => {
      setTimeout(() => {
        this.numbers.push(num);
        this.render();
        
        if (this.numbers.length === 6) {
          this.isGenerating = false;
          this.dispatchEvent(new CustomEvent('generated', {
            detail: { numbers: [...this.numbers] },
            bubbles: true,
            composed: true
          }));
        }
      }, index * 200);
    });
  }

  getBallColor(num) {
    if (num <= 10) return '#fbc02d';
    if (num <= 20) return '#1976d2';
    if (num <= 30) return '#d32f2f';
    if (num <= 40) return '#757575';
    return '#388e3c';
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          text-align: center;
        }
        .balls-container {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin: 2rem 0;
          min-height: 80px;
          flex-wrap: wrap;
        }
        .ball {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: #eee;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .generate-btn {
          background: #4f46e5;
          color: white;
          padding: 1rem 2.5rem;
          font-size: 1.2rem;
          border-radius: 50px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
          transition: all 0.2s;
        }
        .generate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
          background: #4338ca;
        }
        .generate-btn:active {
          transform: translateY(0);
        }
        .generate-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      </style>
      <div class="balls-container">
        ${this.numbers.map(num => `
          <div class="ball" style="background-color: ${this.getBallColor(num)}">${num}</div>
        `).join('')}
        ${this.numbers.length === 0 && !this.isGenerating ? '<p style="color: #94a3b8; font-style: italic;">행운의 버튼을 눌러보세요!</p>' : ''}
      </div>
      <button class="generate-btn" ${this.isGenerating ? 'disabled' : ''}>
        ${this.isGenerating ? '번호 추출 중...' : '번호 생성하기'}
      </button>
    `;

    this.shadowRoot.querySelector('.generate-btn').onclick = () => this.generateNumbers();
  }
}

customElements.define('lotto-generator', LottoGenerator);

/**
 * Main Application Logic
 */
document.addEventListener('DOMContentLoaded', () => {
  const historyList = document.getElementById('history-list');
  const clearBtn = document.getElementById('clear-history');
  let history = JSON.parse(localStorage.getItem('lottoHistory') || '[]');

  const renderHistory = () => {
    if (history.length === 0) {
      historyList.innerHTML = '<p class="empty-msg">아직 생성된 번호가 없습니다.</p>';
      return;
    }

    historyList.innerHTML = history.map((item, idx) => `
      <div class="history-item">
        <div class="balls-small">
          ${item.numbers.map(num => `
            <div class="ball-small" style="background-color: ${getBallColor(num)}">${num}</div>
          `).join('')}
        </div>
        <div class="timestamp">${item.date}</div>
      </div>
    `).join('');
  };

  const getBallColor = (num) => {
    if (num <= 10) return '#fbc02d';
    if (num <= 20) return '#1976d2';
    if (num <= 30) return '#d32f2f';
    if (num <= 40) return '#757575';
    return '#388e3c';
  };

  document.addEventListener('generated', (e) => {
    const newEntry = {
      numbers: e.detail.numbers,
      date: new Date().toLocaleString('ko-KR', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    
    history.unshift(newEntry);
    if (history.length > 10) history.pop(); // Keep last 10
    
    localStorage.setItem('lottoHistory', JSON.stringify(history));
    renderHistory();
  });

  clearBtn.onclick = () => {
    if (confirm('모든 기록을 삭제하시겠습니까?')) {
      history = [];
      localStorage.removeItem('lottoHistory');
      renderHistory();
    }
  };

  renderHistory();
});
