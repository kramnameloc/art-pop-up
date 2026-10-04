import type { Concept } from '../domain/types'

/** Small geometric concept marks only; finished folding artwork belongs to phase 2. */
export function ConceptSketch({ concept }: { concept: Concept }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {concept === 'cooler' && (
        <>
          <path d="m32 74 5 79q1 11 13 11h100q12 0 13-11l5-79" fill="white" />
          <rect x="25" y="54" width="150" height="27" rx="9" fill="white" />
          <path d="M67 54V42q0-7 8-7h50q8 0 8 7v12M68 52V44h64v8M26 92h-8v32h13m138-32h13v32h-15" />
          <circle cx="77" cy="116" r="5" fill="currentColor" stroke="none" />
          <circle cx="123" cy="116" r="5" fill="currentColor" stroke="none" />
          <path d="M90 130q10 12 20 0" />
          <path d="M59 129h7m69 0h7" strokeWidth="3" />
          <path d="m12 44 5-7m160-5 7 3M161 16v8m-4-4h8" strokeWidth="3" />
        </>
      )}
      {concept === 'gift' && (
        <>
          <rect x="36" y="81" width="128" height="88" rx="7" fill="white" />
          <rect x="27" y="59" width="146" height="29" rx="6" fill="white" />
          <path
            d="M91 61C39 63 48 18 72 31c12 6 19 30 19 30Zm9 0c50 3 51-39 27-32-16 5-27 32-27 32Z"
            fill="white"
          />
          <path d="M91 61v108m17-108v108" />
          <circle cx="66" cy="122" r="4" fill="currentColor" stroke="none" />
          <circle cx="136" cy="122" r="4" fill="currentColor" stroke="none" />
          <path d="M73 140q6 5 12 0m33 0q6 5 12 0m57-97v10m-5-5h10M20 24l3 5" strokeWidth="3" />
        </>
      )}
      {concept === 'garden' && (
        <>
          <path
            d="M100 96V57m0 15C76 75 57 64 56 43c23-1 42 7 44 29Zm0-15c0-25 15-37 37-36 0 23-14 38-37 36Z"
            fill="white"
          />
          <path d="m43 106 14 61h86l14-61" fill="white" />
          <rect x="35" y="88" width="130" height="25" rx="6" fill="white" />
          <circle cx="78" cy="133" r="4" fill="currentColor" stroke="none" />
          <circle cx="122" cy="133" r="4" fill="currentColor" stroke="none" />
          <path d="M91 145q9 10 18 0M28 53v11m-5-6h10m133 3 7-4" strokeWidth="3" />
        </>
      )}
    </svg>
  )
}
