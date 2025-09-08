'use client';
import React, { Suspense } from 'react';
import MakeResume from './MakeResume';

export default function Page() {
  return (
    <>
      <Suspense fallback={<h1>Loading...</h1>}>
        <MakeResume />
      </Suspense>
    </>
  );
}