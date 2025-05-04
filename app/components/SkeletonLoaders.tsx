'use client';

import React from 'react';

export const BillSummarySkeleton = () => {
  return (
    <div className="max-w-2xl mx-auto p-4 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-blue-400/50 p-5 rounded-t-xl">
        <div className="flex justify-between items-center">
          <div className="h-7 bg-white/30 rounded-lg w-1/3"></div>
          <div className="h-6 bg-white/30 rounded-full w-1/4"></div>
        </div>
        
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/20 p-3 rounded-lg">
              <div className="h-5 bg-white/30 rounded-full w-1/2 mx-auto mb-2"></div>
              <div className="h-7 bg-white/30 rounded-md w-1/3 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="bg-white rounded-b-xl border border-gray-200 p-5 space-y-6">
        {/* Food items skeleton */}
        <div>
          <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-3"></div>
          <div className="bg-gray-50 rounded-xl border border-gray-200">
            <div className="border-b border-gray-200 p-3">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-7 h-5 bg-gray-200 rounded-md"></div>
                <div className="col-span-2 h-5 bg-gray-200 rounded-md"></div>
                <div className="col-span-3 h-5 bg-gray-200 rounded-md"></div>
              </div>
            </div>
            
            {/* Mimic items */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7 h-5 bg-gray-200 rounded-md"></div>
                  <div className="col-span-2 h-5 bg-gray-200 rounded-md mx-auto w-2/3"></div>
                  <div className="col-span-3 h-5 bg-gray-200 rounded-md ml-auto w-2/3"></div>
                </div>
              </div>
            ))}
            
            {/* Total skeleton */}
            <div className="p-3 bg-blue-50">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-7 h-6 bg-blue-200 rounded-md"></div>
                <div className="col-span-5 h-6 bg-blue-200 rounded-md ml-auto w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Participants skeleton */}
        <div>
          <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
                    <div className="h-5 bg-gray-200 rounded-md w-1/3 ml-2"></div>
                  </div>
                </div>
                <div className="p-4 flex flex-col items-center">
                  <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-2"></div>
                  <div className="h-8 bg-blue-100 rounded-md w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FoodItemsListSkeleton = () => {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-md w-1/4 mb-3"></div>
      
      <div className="bg-gray-50 rounded-xl border border-gray-200">
        <div className="p-3 border-b bg-gray-100">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-5 h-5 bg-gray-300 rounded-md"></div>
            <div className="col-span-3 h-5 bg-gray-300 rounded-md"></div>
            <div className="col-span-4 h-5 bg-gray-300 rounded-md"></div>
          </div>
        </div>
        
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5 h-6 bg-gray-200 rounded-md"></div>
              <div className="col-span-3 h-6 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
              <div className="col-span-4 h-6 bg-gray-200 rounded-md w-1/2 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ButtonSkeleton = () => (
  <div className="h-10 bg-blue-300/50 rounded-md w-full animate-pulse"></div>
);

export const CardSkeleton = ({ height = 'h-40' }: { height?: string }) => (
  <div className={`${height} bg-gray-100 rounded-xl border border-gray-200 animate-pulse`}></div>
); 