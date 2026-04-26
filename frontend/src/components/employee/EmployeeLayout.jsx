import { Outlet } from 'react-router-dom';
import { CSS } from '../../pages/dashboards/employee/EmployeeShared';

export default function EmployeeLayout() {
  return (
    <>
      <style>{CSS}</style>
      <div className="emp-shell">
        {/* add sidebar here if needed */}
        <main className="emp-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
