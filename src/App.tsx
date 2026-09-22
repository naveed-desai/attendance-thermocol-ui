import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/index.ts';
import { fetchEmployees } from './store/slices/employeesSlice.ts';
import { LoginPage } from './components/auth/LoginPage.tsx';
import { Navbar } from './components/Navbar.tsx';
import { EmployeePortal } from './components/employee/EmployeePortal.tsx';
import { AdminPortal } from './components/admin/AdminPortal.tsx';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, currentUser, currentRole } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    // Only fetch all employees if current user is an administrator
    if (currentUser?.role === 'admin') {
      dispatch(fetchEmployees(false));
    }
  }, [dispatch, currentUser?.role]);

  // If user is not authenticated, show the Login Page
  if (!isAuthenticated || !currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* If logged in as employee, always show EmployeePortal; if admin, allow role switching */}
        {currentUser.role === 'employee' || currentRole === 'employee' ? (
          <EmployeePortal />
        ) : (
          <AdminPortal />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Attendance Management & Salary Calculation System • NestJS & React Redux
      </footer>
    </div>
  );
};

export default App;
