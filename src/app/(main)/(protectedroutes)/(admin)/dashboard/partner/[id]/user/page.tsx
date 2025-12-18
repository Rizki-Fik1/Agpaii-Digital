"use client";

import Modal from "@/components/modal/modal";
import API from "@/utils/api/config";
import { useModal } from "@/utils/hooks/use_modal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import queryString from "query-string";

export default function PartnerUsers() {
  const { id } = useParams();
  const pathname = usePathname();
  const { toggle: toggleFilterModal, show: filterModalShow } = useModal();
  const [filter, setFilter] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = queryString.parse(searchParams.toString());

  const { data: partner, isLoading } = useQuery({
    queryKey: ["partner", id],
    queryFn: async () => {
      const res = await API.get(`/partner/${id}`);
      if (res.status == 200) return res.data;
    },
  });

  const { data: subpartners } = useQuery({
    queryKey: ["subpartners", id],
    queryFn: async () => {
      const res = await API.get(`partner/${id}/subpartners`);
      if (res.status == 200) return res.data;
    },
  });

  const { data: users, isLoading: userLoading } = useQuery({
    queryKey: ["users", id, q],
    queryFn: async () => {
      const res = await API.get(
        `/partner/${id}/user?${queryString.stringify(q, {
          arrayFormat: "bracket",
        })}`
      );
      if (res.status == 200) return res.data;
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFilter((prevFilter) =>
      prevFilter.includes(value)
        ? prevFilter.filter((val) => val !== value)
        : [...prevFilter, value]
    );
  };

  useEffect(() => {
    setFilter(
      !!q["filter[]"]
        ? typeof q["filter[]"] === "string"
          ? [q["filter[]"]]
          : q["filter[]"]
        : ([] as any)
    );
  }, [searchParams]);

  const applyFilter = () => {
    router.replace(
      `${pathname}?${queryString.stringify(
        { filter },
        { arrayFormat: "bracket" }
      )}`,
      { scroll: false }
    );
    toggleFilterModal();
  };

  return (
    <>
      {/* Filter Modal */}
      <Modal onClose={toggleFilterModal} show={filterModalShow}>
        <div className="text-left flex flex-col">
          <div className="pt-2 pb-4 text-lg font-medium">Filter</div>
          <div className="flex flex-wrap gap-6">
            {subpartners?.map((p: any, i: number) => (
              <div key={i} className="flex gap-2">
                <input
                  value={p.id.toString()}
                  onChange={handleChange}
                  checked={filter.includes(p.id.toString())}
                  type="checkbox"
                  id={p.id}
                />
                <label htmlFor={p.id}>{p.name}</label>
              </div>
            ))}
          </div>
          <div
            onClick={applyFilter}
            className="flex cursor-default w-full bg-[#009788] text-white text-sm py-2 px-3 text-center mt-8 justify-center rounded-md"
          >
            Apply filter
          </div>
        </div>
      </Modal>
      {/* End Filter Modal */}
      <div className="flex flex-col px-4 sm:px-6 md:px-8 py-6 sm:py-8 lg:py-10">
        <div>
          <h1 className="font-semibold text-lg sm:text-xl md:text-2xl">
            Mitra: {partner?.name}
          </h1>
        </div>
        <div className="flex justify-end mt-8 gap-4 items-center">
          {partner?.has_subpartners && (
            <>
              <div
                onClick={toggleFilterModal}
                className="px-4 py-1.5 text-white bg-[#009788] rounded-md text-sm"
              >
                Filter
              </div>

              <Link
                href={`/dashboard/partner/${id}`}
                className="px-4 py-1.5 bg-[#009788] rounded-md text-white text-sm"
              >
                Lihat Sub Mitra
              </Link>
            </>
          )}
        </div>
        <div>
          {!userLoading && users?.length > 0 && (
            <table className="border border-slate-300 shadow-md  overflow-hidden w-full mt-8">
              <thead>
                <tr className="*:px-4 *:py-3 bg-[#0097884f] *:font-medium ">
                  <td>No</td>
                  <td>Nama</td>
                  <td>No KTA</td>
                  <td>Email</td>
                  {!isLoading && users.length > 0 && <td>Mitra</td>}
                </tr>
              </thead>
              <tbody>
                {users.map((user: any, i: number) => (
                  <tr className="*:px-4 *:py-3 *:max-sm:text-sm" key={i}>
                    <td>{i + 1}</td>
                    <td>{user.user.name}</td>
                    <td>{user.user.kta_id}</td>
                    <td>{user.user.email}</td>
                    <td>{user.partner.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
