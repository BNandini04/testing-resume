import { create } from "zustand"
import { persist } from "zustand/middleware"

interface JobDescription {
  text?: string
  file?: File
}

interface Resume {
  file?: File
}

interface AppState {
  jobDescription: JobDescription
  resume: Resume
}

interface AppActions {
  setJobDescriptionText: (text: string) => void
  setJobDescriptionFile: (file: File) => void
  setResumeFile: (file: File) => void
  reset: () => void
}

type StoreState = AppState & AppActions

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // State
      jobDescription: {},
      resume: {},

      // Actions
      setJobDescriptionText: (text: string) =>
        set((state) => ({
          jobDescription: {
            ...state.jobDescription,
            text,
          },
        })),
      setJobDescriptionFile: (file: File) =>
        set((state) => ({
          jobDescription: {
            ...state.jobDescription,
            file,
          },
        })),
      setResumeFile: (file: File) =>
        set((state) => ({
          resume: {
            ...state.resume,
            file,
          },
        })),
      reset: () =>
        set(() => ({
          jobDescription: {},
          resume: {},
        })),
    }),
    {
      name: "resume-tailor-storage",
    },
  ),
)

export default useStore

