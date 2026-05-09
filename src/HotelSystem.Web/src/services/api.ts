import axios from 'axios';
import { Room, RoomType, CreateRoomRequest, UpdateRoomRequest, Reservation, CreateReservationRequest, Guest, ReservationStatus, RoomStatus, CreateRoomTypeRequest, CreateGuestRequest, UpdateGuestRequest, DashboardStats, DashboardStatsComparison, StatChanges, RevenueChartData } from '../types';

export { type Room, type RoomType, type CreateRoomRequest, type UpdateRoomRequest, type Reservation, type CreateReservationRequest, type Guest, ReservationStatus, RoomStatus, type CreateRoomTypeRequest, type CreateGuestRequest, type UpdateGuestRequest, type DashboardStats, type DashboardStatsComparison, type StatChanges, type RevenueChartData }; // Export for usage in other files

const api = axios.create({
    baseURL: 'http://localhost:5036/api', // Updated to match running backend port
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor for auth token (JWT)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ... existing code ...

export const roomService = {
    getAll: async () => {
        const response = await api.get<Room[]>('/Rooms');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get<Room>(`/Rooms/${id}`);
        return response.data;
    },
    create: async (data: CreateRoomRequest) => {
        const response = await api.post('/Rooms', data);
        return response.data;
    },
    getTypes: async () => {
        const response = await api.get<RoomType[]>('/RoomTypes');
        return response.data;
    },
    createType: async (data: CreateRoomTypeRequest) => {
        const response = await api.post('/RoomTypes', data);
        return response.data;
    },
    updateType: async (id: string, data: CreateRoomTypeRequest) => {
        const response = await api.put(`/RoomTypes/${id}`, { ...data, id });
        return response.data;
    },
    toggleTypeStatus: async (id: string) => {
        await api.patch(`/RoomTypes/${id}/toggle-active`);
    },
    update: async (id: string, data: UpdateRoomRequest) => {
        const response = await api.put(`/Rooms/${id}`, data);
        return response.data;
    },
    toggleActive: async (id: string) => {
        const response = await api.patch(`/Rooms/${id}/toggle-active`);
        return response.data;
    },
    updateStatus: async (id: string, newStatus: RoomStatus) => {
        const response = await api.put(`/Rooms/${id}/status`, { roomId: id, newStatus });
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/Rooms/${id}`);
    }
};

export const reservationService = {
    getAll: async () => {
        const response = await api.get<Reservation[]>('/Reservations');
        return response.data;
    },
    search: async (params: {
        query?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
        page?: number;
        pageSize?: number;
    }) => {
        const queryParams = new URLSearchParams();
        if (params.query) queryParams.append('query', params.query);
        if (params.status) queryParams.append('status', params.status);
        if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
        if (params.dateTo) queryParams.append('dateTo', params.dateTo);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

        const response = await api.get(`/Reservations/search?${queryParams.toString()}`);
        return response.data;
    },
    create: async (data: CreateReservationRequest) => {
        const response = await api.post('/Reservations', data);
        return response.data;
    },
    cancel: async (id: string) => {
        await api.delete(`/Reservations/${id}`);
    },
    checkIn: async (id: string) => {
        const response = await api.post(`/Reservations/${id}/checkin`);
        return response.data;
    },
    checkOut: async (id: string) => {
        const response = await api.post(`/Reservations/${id}/checkout`);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.put(`/Reservations/${id}`, { ...data, id });
        return response.data;
    }
};

export const guestService = {
    getAll: async () => {
        const response = await api.get<Guest[]>('/Guests');
        return response.data;
    },
    create: async (data: CreateGuestRequest) => {
        const response = await api.post('/Guests', data);
        return response.data;
    },
    update: async (id: string, data: UpdateGuestRequest) => {
        const response = await api.put(`/Guests/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/Guests/${id}`);
    },
    toggleActive: async (id: string) => {
        const response = await api.patch(`/Guests/${id}/toggle-active`, {});
        return response.data;
    }
};

export const frontDeskService = {
    checkIn: async (reservationId: string) => {
        const response = await api.post('/FrontDesk/CheckIn', { reservationId });
        return response.data;
    },
    checkOut: async (reservationId: string) => {
        const response = await api.post('/FrontDesk/CheckOut', { reservationId });
        return response.data;
    }
};



export const authService = {
    login: async (data: any) => {
        const response = await api.post('/Auth/Login', data);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            if (response.data.role) {
                localStorage.setItem('role', response.data.role);
            }
            if (response.data.email) {
                localStorage.setItem('userEmail', response.data.email);
            }
            if (response.data.userName) {
                localStorage.setItem('userName', response.data.userName);
            }
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
    },
    changePassword: async (data: any) => {
        const response = await api.post('/Auth/ChangePassword', data);
        return response.data;
    }
};

export const dashboardService = {
    getStats: async () => {
        const response = await api.get<DashboardStats>('/Dashboard/Stats');
        return response.data;
    },
    getStatsComparison: async (startDate?: string, endDate?: string, previousPeriodDays: number = 30) => {
        const params: any = { previousPeriodDays };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get('/Dashboard/StatsComparison', { params });
        return response.data;
    },
    getRevenueChart: async (startDate: string, endDate: string) => {
        const response = await api.get('/Dashboard/RevenueChart', {
            params: { startDate, endDate }
        });
        return response.data;
    }
};

export interface Settings {
    id: string;
    companyName: string;
    documentNumber: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logoBase64: string | null;
    currency: string;
    currencySymbol: string;
    timeZone: string;
    dateFormat: string;
    timeFormat: string;
    language: string;
    sessionTimeout: number;
    createdAt: string;
    updatedAt: string;
}

export const settingsService = {
    get: async () => {
        const response = await api.get<Settings>('/Settings');
        return response.data;
    },
    update: async (settings: Settings) => {
        const response = await api.put<Settings>('/Settings', settings);
        return response.data;
    }
};

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'Info' | 'Success' | 'Warning' | 'Error';
    isRead: boolean;
    createdAt: string;
}

export const notificationService = {
    getAll: async (limit: number = 10) => {
        const response = await api.get<Notification[]>('/Notifications', { params: { limit } });
        return response.data;
    },
    getUnreadCount: async () => {
        const response = await api.get<{ count: number }>('/Notifications/unread-count');
        return response.data;
    },
    markAsRead: async (id: string) => {
        await api.post(`/Notifications/${id}/read`);
    },
    markAllAsRead: async () => {
        await api.post('/Notifications/mark-all-read');
    }
};

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    role: string;
}

export const userService = {
    getAll: async () => {
        const response = await api.get<User[]>('/Users');
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/Users', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.put(`/Users/${id}`, data);
        return response.data;
    },
    toggleStatus: async (id: string) => {
        await api.post(`/Users/${id}/toggle-status`);
    },
    delete: async (id: string) => {
        await api.delete(`/Users/${id}`);
    }
};

export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValues?: string;
    newValues?: string;
    timestamp: string;
    ipAddress: string;
}

export const auditService = {
    getAll: async (limit: number = 100) => {
        const response = await api.get<AuditLog[]>('/Audit', { params: { limit } });
        return response.data;
    },
    getByUser: async (userId: string, limit: number = 50) => {
        const response = await api.get<AuditLog[]>(`/Audit/user/${userId}`, { params: { limit } });
        return response.data;
    }
};

// Report Interfaces
export interface RevenueReport {
    totalRevenue: number;
    revenueByDate: { date: string; amount: number }[];
    revenueByRoomType: { roomTypeName: string; revenue: number; reservationCount: number }[];
}

export interface OccupancyReport {
    currentOccupancyRate: number;
    totalRooms: number;
    occupiedRooms: number;
    occupancyByDate: { date: string; occupancyRate: number }[];
}

export interface GuestStats {
    totalGuests: number;
    newGuestsThisMonth: number;
    returningGuests: number;
    guestsByCountry: { country: string; count: number }[];
}

export const reportService = {
    getRevenue: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await api.get<RevenueReport>(`/Reports/revenue?${params}`);
        return response.data;
    },
    getOccupancy: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await api.get<OccupancyReport>(`/Reports/occupancy?${params}`);
        return response.data;
    },
    getGuestStats: async () => {
        const response = await api.get<GuestStats>('/Reports/guest-stats');
        return response.data;
    }
};

export default api;
