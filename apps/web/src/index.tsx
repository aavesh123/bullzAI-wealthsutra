import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import './styles/global.css';
import Landing from './routes/index';
import Dashboard from './routes/dashboard';
import './lib/sms-bridge'; // Initialize SMS bridge

function App() {
  return (
    <Router>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
    </Router>
  );
}

const root = document.getElementById('root');
if (root) {
  render(() => <App />, root);
}

