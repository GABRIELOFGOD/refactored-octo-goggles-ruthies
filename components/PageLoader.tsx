
interface PageLoaderProps {
  fullHeight?: boolean;
}

export default function PageLoader({ fullHeight = true }: PageLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${fullHeight ? "min-h-full" : "h-screen"}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}