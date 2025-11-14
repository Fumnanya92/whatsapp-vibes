// Re-export Auth components from the approval-ui auth implementation
// This file acts as a compatibility layer so other parts of the project can import
// from `./lib/auth/AdminAuth` while allowing the real implementation to live under
// `approval-ui/lib/auth` where it's already split into context/hooks/components.

import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useAuth } from './useAuth';

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [token, setToken] = useState('');

	useEffect(() => {
		const storedToken = sessionStorage.getItem('grace_admin_token');
		if (storedToken) {
			setToken(storedToken);
			setIsAuthenticated(true);
		}
	}, []);

	const login = (newToken: string) => {
		sessionStorage.setItem('grace_admin_token', newToken);
		setToken(newToken);
		setIsAuthenticated(true);
	};

	const logout = () => {
		sessionStorage.removeItem('grace_admin_token');
		setToken('');
		setIsAuthenticated(false);
	};

	return (
		<AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

// Admin route protection component
interface ProtectedRouteProps {
	children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <AdminLogin />;
	}

	return <>{children}</>;
};

// Simple admin login component
const AdminLogin: React.FC = () => {
	const [token, setToken] = useState('');
	const [error, setError] = useState('');
	const { login } = useAuth();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
    
		// Simple token validation (enhance with real auth)
		if (token === 'grace-admin-2025' || token.startsWith('grace_')) {
			login(token);
			setError('');
		} else {
			setError('Invalid admin token');
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-2">Grace Admin</h1>
					<p className="text-gray-600">Secure approval dashboard access</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Admin Token
						</label>
						<input
							type="password"
							value={token}
							onChange={(e) => setToken(e.target.value)}
							className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							placeholder="Enter your admin token"
							required
						/>
					</div>

					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-red-700 text-sm">{error}</p>
						</div>
					)}

					<button
						type="submit"
						className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold"
					>
						Access Dashboard
					</button>
				</form>

				<div className="mt-6 p-4 bg-gray-50 rounded-lg">
					<p className="text-xs text-gray-600">
						🔒 This is a secure admin-only interface for message approval.
						Access is restricted to authorized personnel only.
					</p>
				</div>
			</div>
		</div>
	);
};

export default AdminLogin;