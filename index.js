// ⚡️ Import Styles
import './style.scss';
import feather from 'feather-icons';
import { showNotification } from './modules/showNotification.js';
import { uid } from './modules/uid.js';

// ⚡️ Render Skeleton
document.querySelector('#app').innerHTML = `
<div class='app-container'>
  <div class='expense-tracker'>
    <h3>Expense Tracker</h3>

    <div class='container'>
      <header>
        <h2 class='h5'>Your Balance</h2>
        <p class='h4' data-balance>$0.00</p>
      </header>

      <ul class='stats'>
        ${['plus', 'minus'].map(i => `
          <li>
            <p>${i === 'plus' ? 'Income' : 'Expense'}</p>
            <p data-${i} class='stats__item stats__item--${i}'>${i === 'plus' ? '+$0.00' : '-$0.00'}</p>
          </li>
        `).join('')}
      </ul>

      <h5>History</h5>
      <ul class='history' data-history></ul>

      <h5>Add new transaction</h5>
      <form data-form>
        <label>
          <span>Text</span>
          <input type='text' id='text' name='text' placeholder='Enter text' />
        </label>
          <label>
            <span>Amount (negative - expense, positive - income)</span>
            <input type='number' id='amount'  name='amount' placeholder='Enter amount' />
          </label>
          <button class='button'>Add transaction</button>
        </form>
    </div>
  </div>
</div>

  <a class='app-author' href='https://github.com/nagoev-alim' target='_blank'>${feather.icons.github.toSvg()}</a>
</div>
`;

// ⚡️Create Class
class App {
  constructor() {
    this.DOM = {
      balanceValue: document.querySelector('[data-balance]'),
      plusValue: document.querySelector('[data-plus]'),
      minusValue: document.querySelector('[data-minus]'),
      history: document.querySelector('[data-history]'),
      form: document.querySelector('[data-form]'),
    };

    this.PROPS = {
      transactions: this.storageGet(),
    };

    this.storageDisplay();

    this.DOM.form.addEventListener('submit', this.onSubmit);
    this.DOM.history.addEventListener('click', this.onDelete);
  }

  /**
   * @function storageGet - Get data from local storage
   * @returns {any|*[]}
   */
  storageGet = () => localStorage.getItem('transactions') ? JSON.parse(localStorage.getItem('transactions')) : [];

  /**
   * @function storageAdd - Add data to local storage
   */
  storageAdd = () => localStorage.setItem('transactions', JSON.stringify(this.PROPS.transactions));

  /**
   * @function storageDisplay - Get and display data from local storage
   */
  storageDisplay = () => {
    this.PROPS.transactions = this.storageGet();
    this.PROPS.transactions.forEach(i => this.renderHTML(i));
    this.updateBalance();
  };

  /**
   * @function onSubmit - Form submit handler
   * @param event
   */
  onSubmit = (event) => {
    event.preventDefault();

    const form = event.target;
    const { text, amount } = Object.fromEntries(new FormData(form).entries());

    if (text.trim().length === 0 || amount.trim().length === 0) {
      showNotification('warning', 'Please add a text and amount');
      return;
    }

    const transaction = {
      id: uid(),
      text,
      amount: Number(amount),
    };

    this.PROPS.transactions.push(transaction);
    this.updateBalance();
    this.storageAdd();
    this.renderHTML(transaction);

    form.reset();
  };

  /**
   * @function renderHTML - Render data HTML
   * @param data
   */
  renderHTML = ({ id, text, amount }) => {
    const li = document.createElement('li');
    li.classList.add(amount < 0 ? 'minus' : 'plus');
    li.innerHTML = `
      <p>${text}</p>
      <span>${amount < 0 ? '-' : '+'}${Math.abs(amount)}</span>
      <button class='' data-id='${id}'>
        ${feather.icons.x.toSvg()}
      </button>
  `;

    this.DOM.history.appendChild(li);
  };

  /**
   * @function updateBalance - Calculate balance
   */
  updateBalance = () => {
    const amounts = this.PROPS.transactions.map(({ amount }) => amount);

    const total = amounts
      .reduce((acc, item) => (acc += item), 0)
      .toFixed(2);

    const income = amounts
      .filter(item => item > 0)
      .reduce((acc, item) => (acc += item), 0)
      .toFixed(2);

    const expense = (amounts.filter(item => item < 0)
      .reduce((acc, item) => (acc += item), 0) * -1)
      .toFixed(2);

    this.DOM.balanceValue.innerText = `$${total}`;
    this.DOM.plusValue.innerText = `$${income}`;
    this.DOM.minusValue.innerText = `$${expense}`;
  };

  /**
   * @function onDelete - Delete event handler
   * @param target
   */
  onDelete = ({ target }) => {
    if (target.matches('[data-id]') && window.confirm('Are you sure?')) {
      this.PROPS.transactions = this.PROPS.transactions.filter(({ id }) => id !== target.dataset.id);
      this.storageAdd();
      this.DOM.history.innerHTML = '';
      this.PROPS.transactions.forEach(i => this.renderHTML(i));
      this.updateBalance();
    }
  };
}

// ⚡️Class instance
new App();
