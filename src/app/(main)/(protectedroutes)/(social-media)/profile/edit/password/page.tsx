"use client";
import FormControl from "@/components/form/form_control";
import Loader from "@/components/loader/loader";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ChangePassword() {
  const router = useRouter();
  const { mutate: changePassword, isPending: pendingChangePass } = useMutation({
    mutationFn: async (data: any) => {
      try {
        const res = await API.post("/change-password", data);
        if (res.status == 200) return res.data;
      } catch (error: any) {
        throw new Error("Password lama tidak sesuai");
      }
    },
    onSuccess: async () => {
      toast.info("Berhasil Mengubah Password");
      router.push("/profile/edit");
    },
    onError: async (err) => toast.error(err.message),
  });
  const { register, handleSubmit } = useForm();
  return (
    <div className="pt-[3.9rem]">
      <TopBar withBackButton>
        <span>Ganti Password</span>
      </TopBar>
      <form
        onSubmit={handleSubmit(changePassword as any)}
        className="py-6 mt-6 flex flex-col px-4 sm:px-6 gap-3.5"
      >
        <div className="flex flex-col">
          <div className="mb-1 text-sm text-slate-700">
            <h1>Password Lama</h1>
          </div>
          <FormControl
            register={register}
            className="rounded-md overflow-hidden"
            inputType="password"
            name="old_password"
            placeholder="Password Lama"
            type={"input"}
          />
        </div>
        <div className="flex flex-col">
          <div className="mb-1 text-sm text-slate-700">
            <h1>Password Baru</h1>
          </div>
          <FormControl
            register={register}
            className="rounded-md overflow-hidden"
            inputType="password"
            name="new_password"
            placeholder="Password Lama"
            type={"input"}
          />
        </div>
        {pendingChangePass ? (
          <div className="mt-8 flex justify-center">
            <Loader className="size-7" />
          </div>
        ) : (
          <button className="px-3 py-2 mt-8 rounded-md text-white bg-[#009788]">
            Ganti Password
          </button>
        )}
      </form>
    </div>
  );
}
