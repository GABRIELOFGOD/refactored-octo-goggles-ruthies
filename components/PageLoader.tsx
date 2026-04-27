
interface PageLoaderProps {
  fullHeight?: boolean;
}

export default function PageLoader({ fullHeight = true }: PageLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${fullHeight ? "min-h-screen" : "h-full"}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}