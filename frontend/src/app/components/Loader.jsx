export default function Loader(){
    return(
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="relative">
                {/* Pulsing glow effect */}
                <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20 scale-150"></div>
                
                {/* Main spinner with enhanced styling */}
                <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-500 border-r-blue-400 shadow-2xl">
                    {/* Inner glow */}
                    <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-white border-r-gray-200 animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
                </div>
                
                {/* Orbiting dots for extra attention */}
                <div className="absolute inset-0 animate-spin" style={{animationDuration: '2s'}}>
                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1 shadow-lg"></div>
                </div>
                <div className="absolute inset-0 animate-spin" style={{animationDuration: '2s', animationDelay: '0.5s'}}>
                    <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full -translate-x-1/2 translate-y-1 shadow-lg"></div>
                </div>
            </div>
        </div>
    );
}