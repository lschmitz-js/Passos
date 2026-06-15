import { Route, Switch } from 'wouter';
import { HomePage } from './pages/HomePage';
import { ZooPage } from './pages/ZooPage';
import { DashboardPage } from './pages/DashboardPage';
import { LocaleProvider, useT } from './lib/i18n';

function NotFound() {
  const t = useT();
  return <div className="p-10 text-center text-muted">{t('animal.notFound')}</div>;
}

export function App() {
  return (
    <LocaleProvider>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/zoo" component={ZooPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </LocaleProvider>
  );
}
