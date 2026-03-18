"use client";

import TopBar from "@/components/nav/topbar";
import Rpp from "@/components/rpp/rpp";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { PlusIcon } from "@heroicons/react/16/solid";
import { useInfiniteQuery } from "@tanstack/react-query";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useInView } from "react-intersection-observer";

export default function RppDigitalPage() {
  const [type, setType] = useState<"all" | "me">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpandedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const { auth } = useAuth();
  
  const SWIPE_THRESHOLD = 50;

  // Keep ref in sync with state
  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);
  
  const getUrl = (type: "all" | "me") => {
    return type === "all"
      ? "/user/lesson-plans/all?page="
      : `/user/lesson-plans/user/${auth.id}?page=`;
  };
  
  const {
    data: rpps,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["rpps", type],
    initialPageParam: 1,
    staleTime: 0,
    queryFn: async ({ pageParam }) => {
      const res = await API.get(getUrl(type) + pageParam);
      if (res.status == 200) {
        return {
          nextPage:
            res.data.next_page_url !== null
              ? parseInt(res.data.next_page_url.split("=")[1])
              : undefined,
          data: res.data.data,
        };
      }
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px', // Trigger 100px sebelum sampai ke bottom
  });

  useEffect(() => {
    if (inView && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, isFetchingNextPage, fetchNextPage]);

  // Filter RPP based on search and grade
  const filteredRpps = rpps?.pages.map(page => ({
    ...page,
    data: page?.data.filter((rpp: any) => {
      const matchSearch = searchQuery === "" || 
        rpp.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rpp.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rpp.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchGrade = selectedGrade === "" || 
        rpp.grade?.educational_level_id?.toString() === selectedGrade;
      
      return matchSearch && matchGrade;
    })
  }));

  const totalResults = filteredRpps?.reduce((acc, page) => acc + (page?.data?.length || 0), 0) || 0;

  const handleSearch = () => {
    // Trigger search - already filtered in real-time
    console.log("Searching with:", { searchQuery, selectedGrade });
  };

  // Handle touch events for swipe gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const swipeDistance = dragStartY.current - e.targetTouches[0].clientY;
    if (swipeDistance > 0) e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const swipeDistance = dragStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
      if (swipeDistance > 0 && !isExpanded) setIsExpanded(true);
      else if (swipeDistance < 0 && isExpanded) setIsExpanded(false);
    }
    dragStartY.current = null;
  };

  // Handle mouse drag for desktop — attach move/up to window so drag outside element still works
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStartY.current = e.clientY;

    const onMouseMove = () => {}; // just to keep cursor consistent

    const onMouseUp = (upEvent: MouseEvent) => {
      if (dragStartY.current === null) return;
      const swipeDistance = dragStartY.current - upEvent.clientY;
      if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
        if (swipeDistance > 0 && !isExpandedRef.current) setIsExpanded(true);
        else if (swipeDistance < 0 && isExpandedRef.current) setIsExpanded(false);
      }
      dragStartY.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <TopBar withBackButton>RPP Digital</TopBar>
      
      {/* Tab Navigation - Always visible with sticky positioning */}
      <div className="sticky top-[4.21rem] flex relative text-center pt-3 pb-4 text-sm text-slate-700 border-b border-b-slate-300 bg-white flex-shrink-0 z-50">
        <span
          className={clsx(
            "px-6 py-[0.1rem] bg-[#009788] absolute w-1/2 bottom-0 transition-all duration-300",
            type == "all" ? "left-0" : "right-0"
          )}
        ></span>
        <div className="w-1/2 cursor-pointer" onClick={() => setType("all")}>
          Semua RPP
        </div>
        <div className="w-1/2 cursor-pointer" onClick={() => setType("me")}>
          RPP Saya
        </div>
      </div>

      {/* Search and Filter Section - Only show when not expanded */}
      {!isExpanded && (
        <div className="bg-white px-6 py-6 space-y-4 shadow-sm flex-shrink-0 mt-14">
        {/* Search Title */}
        <h2 className="text-lg font-semibold text-gray-800">Cari Pembelajaran</h2>
        
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Pembelajaran"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009788] focus:border-[#009788] outline-none text-sm"
          />
          <svg 
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Grade Filter */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-800">Pilih Jenjang</h3>
          <p className="text-sm text-gray-500">Pilih jenjang kelas yang sesuai</p>
          
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009788] focus:border-[#009788] outline-none text-sm appearance-none bg-white"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.25rem'
            }}
          >
            <option value="">Pilih Kelas</option>
            <option value="5">TK</option>
            <option value="1">SD</option>
            <option value="2">SMP</option>
            <option value="3">SMA</option>
            <option value="4">SMK</option>
            <option value="9">SLB</option>
          </select>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="w-full bg-[#009788] hover:bg-[#00867a] text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Telusuri RPP
        </button>
      </div>
      )}

      {/* Results Section - Flex grow to fill remaining space */}
      <div 
        ref={containerRef}
        className={`transition-all duration-500 ease-out ${
          isExpanded 
            ? 'fixed z-40 bottom-0 right-0 md:left-20 lg:left-64' // Align to content area, not viewport center
            : 'flex-1 px-0 py-6 overflow-hidden' // Normal state
        }`}
        style={isExpanded ? {
          top: 'calc(4.21rem + 3.5rem)', // TopBar height + Tab Navigation height
        } : {}}
      >
        {/* Results Container with white background */}
        <div 
          className={`bg-white h-full flex flex-col transition-all duration-500 ease-out ${
            isExpanded ? 'rounded-none' : 'rounded-3xl'
          }`}
          style={{ 
            boxShadow: isExpanded 
              ? 'none' 
              : '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)' 
          }}
        >
          {/* Draggable Area - Includes handle bar and header */}
          <div
            className="cursor-grab active:cursor-grabbing select-none flex-shrink-0 touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          >
            {/* Top Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-24 h-1 bg-gray-300 rounded-full pointer-events-none"></div>
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center px-8 py-6 pointer-events-none">
              <p className="text-base text-gray-400">
                Menampilkan hasil pencarian
              </p>
              <p className="text-lg font-bold text-[#009788]">
                {totalResults} hasil
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="px-8 flex-shrink-0">
            <div className="border-t border-gray-200"></div>
          </div>

          {/* RPP List - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#009788] border-t-transparent"></div>
              </div>
            ) : (
              <>
                {filteredRpps?.map((page, i) => (
                  <div key={i} className="flex flex-col">
                    {page?.data && page.data.length > 0 ? (
                      page.data.map((rpp: any, index: any) => (
                        <div key={index} className="border-b border-gray-100 last:border-b-0">
                          <Rpp rpp={rpp} />
                        </div>
                      ))
                    ) : i === 0 ? (
                      <div className="px-8 py-12 text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium">Tidak Ada RPP</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchQuery || selectedGrade ? "Coba ubah filter pencarian" : "Belum ada RPP yang tersedia"}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ))}
                <div ref={ref}></div>
                {isFetchingNextPage && (
                  <div className="flex justify-center py-4 border-t border-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#009788] border-t-transparent"></div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <Link
        href={"/rpp/new"}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-[#009788] hover:bg-[#00867a] shadow-lg hover:shadow-xl transition-all z-50"
      >
        <PlusIcon className="fill-white size-6" />
      </Link>
    </div>
  );
}
