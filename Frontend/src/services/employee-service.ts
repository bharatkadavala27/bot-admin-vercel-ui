import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface WeeklyHoliday {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  weeks: number[]; // [] = all, [1,3] = 1st & 3rd
}

export interface SalaryComponent {
  enabled: boolean;
  percentage: number;
}

export interface Employee {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  departmentId?: string;
  branchId?: string;
  shiftId?: string;
  salary: number;
  profileImage?: string;
  status: 'active' | 'inactive';
  weeklyHolidays: WeeklyHoliday[];
  salaryComponents: {
    tds: SalaryComponent;
    tdsCategory?: string;
    basic: SalaryComponent;
    da: SalaryComponent;
    hra: SalaryComponent;
    ca: SalaryComponent;
    pf: SalaryComponent;
    esic: SalaryComponent;
    epf: SalaryComponent;
    tdsOnProfession: SalaryComponent;
    retention: SalaryComponent;
    pt: SalaryComponent;
    adminCharge: SalaryComponent;
    bonus: SalaryComponent;
  };
  gender?: 'male' | 'female' | 'other';
  dob?: string;
  joiningDate?: string;
  employmentType?: 'monthly' | 'daily' | 'hourly';
  leadDeletionPermission?: boolean;
  address?: string;
  bloodGroup?: string;
  contactPersonName?: string;
  contactPersonMobile?: string;
  aadhaarNo?: string;
  panNo?: string;
  experience?: string;
  residentialAddress?: string;
  residentialPhone?: string;
  education?: string;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    ifsc: string;
    branchName: string;
    nameAsPerBank: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export function useEmployeeService() {
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading, isFetching } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data } = await apiClient.get("/users/employees");
      return data;
    },
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData | Partial<Employee>) => {
      const { data } = await apiClient.post("/users/employees", formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create employee");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData | Partial<Employee> }) => {
      const { data: response } = await apiClient.put(`/users/employees/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update employee");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/users/employees/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deleted successfully");
    },
  });

  return {
    employees,
    isLoading,
    isFetching,
    createEmployee: createMutation.mutateAsync,
    updateEmployee: updateMutation.mutateAsync,
    deleteEmployee: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
