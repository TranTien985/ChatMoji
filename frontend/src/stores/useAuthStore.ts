import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authServices";
import type { AuthState } from "@/types/store";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  setAccessToken: (accessToken) => {
    set({ accessToken });
  },
  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
  },

  signUp: async (username, password, email, firstName, lastName) => {
    try {
      set({ loading: true });

      //  gọi api
      await authService.signUp(username, password, email, firstName, lastName);

      toast.success(
        "Đăng ký thành công! Bạn sẽ được chuyển sang trang đăng nhập.",
      );
    } catch (error) {
      console.error(error);
      toast.error("Đăng ký không thành công");
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (username, password) => {
    try {
      set({ loading: true });

      const { accessToken } = await authService.signIn(username, password);
      get().setAccessToken(accessToken);

      await get().fetchMe(); // sau khi đăng nhập xong app sẽ lấy thông tin người dùng và lưu vào store

      toast.success("Chào mừng bạn quay lại với Moji 🎉");
    } catch (error) {
      console.error(error);
      toast.error("Đăng nhập không thành công!");
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      get().clearState();
      await authService.signOut();
      toast.success("LogOut thành công!");
    } catch (error) {
      console.error(error);
      toast.error("lỗi xảy ra khi logout, hãy thử lại");
    } finally {
      set({ loading: false });
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();

      set({ user });
    } catch (error) {
      console.error(error);
      toast.error("lỗi xảy ra khi lấy giữ liệu người dùng hãy thử lại");
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    try {
      set({loading: true})
      const { user, fetchMe, setAccessToken } = get();
      const accessToken = await authService.refresh();

      setAccessToken(accessToken);

      if (!user) {
        await fetchMe();
      }
    } catch (error) {
      console.error(error);
      toast.error("Phiên đăng nhập đã hết hạn vui lòng đăng nhập lại");
      get().clearState();
    } finally {
      set({loading: false})
    }
  },
}));
