"use client";;
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Upload, X, Play, Pause } from "lucide-react";

// Utility function to truncate filename
const truncateFilename = (filename, maxLength = 30) => {
  if (filename.length <= maxLength) return filename;
  const extension = filename.split(".").pop();
  const nameWithoutExt = filename.replace(`.${extension}`, "");
  const truncatedName = nameWithoutExt.substring(0, maxLength - 3 - extension.length);
  return `${truncatedName}...${extension}`;
};

const VideoComponent = ({
  isAnimating,
  onAnimationComplete,
  filename = "image.png",
  onRemove,
  videoUrl,
  mimeType = "image/png"
}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const videoRef = useRef(null);
  const isVideo = mimeType.startsWith("video/");

  // Update shouldShow when isAnimating changes
  useEffect(() => {
    if (isAnimating) {
      setShouldShow(true);
    }
  }, [isAnimating]);

  // Reset media loaded state when video URL changes
  useEffect(() => {
    if (videoUrl) {
      setMediaLoaded(false);
    }
  }, [videoUrl]);

  // Don't render if we shouldn't show and we're not removing
  if (!shouldShow && !isRemoving) return null;

  const displayName = truncateFilename(filename);

  const handleRemove = () => {
    setIsRemoving(true);
    setIsPlaying(false);
  };

  const handleRemoveComplete = () => {
    setShouldShow(false);
    setIsRemoving(false);
    onRemove?.();
  };

  const handlePlayClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Handle media loading
  const handleMediaLoaded = () => {
    setMediaLoaded(true);
    if (isVideo && videoRef.current) {
      videoRef.current.addEventListener("ended", handleVideoEnd);
      // Pause immediately to show first frame
      videoRef.current.pause();
      // Set to a small time offset to show first frame
      videoRef.current.currentTime = 0.01;
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          // Between border (z-20) and upload area (z-0)
          className="absolute z-10"
          initial={{
            // Start way above the screen so you first see the bottom edge
            left: "50%",
            top: "-300px", // Way above the screen
            x: "-50%",
            y: 0,
            opacity: 1, // Fully visible from start
          }}
          animate={
            isRemoving
              ? {
                scale: 0,
                opacity: 0,
                filter: "blur(8px)",
                transition: {
                  duration: 0.4,
                  ease: [0.23, 1, 0.32, 1],
                },
              }
              : {
                // Vending machine drop - slow start, fast finish
                left: "50%",
                top: "calc(50% - 0px)", // Center of upload area
                x: "-50%",
                y: "-50%",
                opacity: 1,
                transition: {
                  duration: 1.2, // Slightly longer for dramatic effect
                  ease: [0.55, 0.055, 0.675, 0.19], // Vending machine gravity curve - slow start, fast finish
                },
              }
          }
          exit={{
            scale: 0,
            opacity: 0,
            filter: "blur(8px)",
            transition: {
              duration: 0.4,
              ease: [0.23, 1, 0.32, 1],
            },
          }}
          style={{
            transformOrigin: "center",
          }}
          onAnimationComplete={
            isRemoving ? handleRemoveComplete : onAnimationComplete
          }>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={
              isRemoving
                ? {
                  scale: 0,
                  transition: { duration: 0.4 },
                }
                : {
                  scale: 1.0,
                  transition: {
                    type: "spring",
                    stiffness: 250,
                    damping: 15, // Less damping for more bounce on landing
                    mass: 1.2,
                    delay: 0.7, // Delay until the drop is almost complete
                  },
                }
            }
            className="rounded-lg bg-muted backdrop-blur-sm shadow-lg relative group w-full">
            {/* X button */}
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110 z-30">
              <X size={12} />
            </button>

            {/* Video Preview or Video Player */}
            <div className="relative">
              {videoUrl ? (
                <div className="relative">
                  {isVideo ? (
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full aspect-video object-cover rounded-md shadow-md border-t border-l border-r border-border/30"
                      onEnded={handleVideoEnd}
                      onLoadedData={handleMediaLoaded}
                      controls={false}
                      muted
                      playsInline />
                  ) : (
                    <img
                      src={videoUrl}
                      alt={displayName}
                      className="w-full aspect-video object-cover rounded-md shadow-md border-t border-l border-r border-border/30"
                      onLoad={handleMediaLoaded}
                    />
                  )}
                  {/* Loading overlay - shows until media loads */}
                  {!mediaLoaded && (
                    <div
                      className="absolute inset-0 bg-muted rounded-md flex items-center justify-center">
                      <div
                        className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {/* Play button in bottom left corner - only for video */}
                  {isVideo && (
                    <button
                      onClick={handlePlayClick}
                      className="absolute bottom-0 left-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 group">
                      {isPlaying ? (
                        <Pause size={14} className="text-white ml-0.5" />
                      ) : (
                        <Play size={14} className="text-white ml-0.5" />
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className="w-full aspect-[21/9] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-md flex items-center justify-center cursor-pointer hover:from-primary/30 hover:to-secondary/30 transition-colors duration-200">
                  <div
                    className="w-20 h-20 bg-primary/30 rounded-full flex items-center justify-center hover:bg-primary/40 transition-colors duration-200">
                    <Play size={28} className="text-primary ml-1" />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2 px-2 pb-2">
              <span className="text-xs text-foreground/60 font-medium text-left block">
                {displayName}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const UploadCardBase = ({
  children,
  className,
  isDragOver = false,
  isUploading = false
}) => {
  const hasChildren = React.Children.count(children) > 0;

  return (
    <div className="relative">
      {/* Background upload area - z-0 */}
      <div
        className={cn(
          "rounded-xl min-h-[150px] flex items-center justify-center relative transition-colors duration-200 z-0",
          // Add cursor pointer when clickable and not uploading
          !isUploading && "cursor-pointer hover:bg-accent/20",
          // Background color changes based on state
          isUploading
            ? "bg-[rgb(27,55,121)]/10"
            : isDragOver
              ? "bg-[rgb(27,55,121)]/20 shadow-inner"
              : "bg-[rgb(27,55,121)]/5",
          className
        )}>
        {/* Upload icon in background - only shows when no children */}
        {!hasChildren && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Upload
              size={32}
              className={cn(
                "transition-colors duration-200",
                isDragOver ? "text-[rgb(27,55,121)]" : "text-[rgb(27,55,121)]/20",
                isUploading && "text-[rgb(27,55,121)]"
              )} />
          </div>
        )}

        {/* Content layer - above the background icon */}
        <div className="relative z-10 w-full">{children}</div>
      </div>
      {/* Dashed border overlay - z-20, sits above video component */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl border-2 border-dashed pointer-events-none z-20",
          isUploading
            ? "border-[rgb(27,55,121)]/40"
            : isDragOver
              ? "border-[rgb(27,55,121)]/60"
              : "border-[rgb(27,55,121)]/20"
        )} />
    </div>
  );
};

export function VideoUploadCard({
  className,
  triggerAnimation = false,
  onAnimationComplete,
  onFileChange,
  title = "Upload Image",
  description = "Drop in your image."
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (triggerAnimation) {
      setIsAnimating(true);
    }
  }, [triggerAnimation]);

  const handleAnimationComplete = () => {
    // Don't automatically stop the animation - keep it visible
    onAnimationComplete?.();
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const mediaFile = files.find((file) => file.type.startsWith("image/"));

    if (mediaFile) {
      setUploadedFile(mediaFile);
      setIsUploading(true);
      if (onFileChange) onFileChange(mediaFile);

      // Create object URL for media preview
      const url = URL.createObjectURL(mediaFile);
      setVideoUrl(url);

      // Simulate upload process
      setTimeout(() => {
        setIsUploading(false);
        setIsAnimating(true); // Trigger animation after upload
      }, 200); // Much faster upload simulation
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setUploadedFile(file);
      setIsUploading(true);
      if (onFileChange) onFileChange(file);

      // Create object URL for video preview
      const url = URL.createObjectURL(file);
      setVideoUrl(url);

      // Simulate upload process
      setTimeout(() => {
        setIsUploading(false);
        setIsAnimating(true); // Trigger animation after upload
      }, 200); // Much faster upload simulation
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setIsAnimating(false);
    if (onFileChange) onFileChange(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    // Reset the file input so it can trigger onChange again for the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [videoUrl]);

  const handleBaseClick = useCallback(() => {
    if (!isUploading && !uploadedFile) {
      fileInputRef.current?.click();
    }
  }, [isUploading, uploadedFile]);

  return (
    <motion.div
      className={cn("relative w-full", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-card text-center"
        )}>


        <div className="flex flex-col justify-center space-y-4 p-4">
          <div className="relative w-full mx-auto">
            <div
              className="relative"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBaseClick}>
              <UploadCardBase isDragOver={isDragOver} isUploading={isUploading} />

              {/* Video Component - positioned relative to upload area */}
              <VideoComponent
                isAnimating={isAnimating}
                onAnimationComplete={handleAnimationComplete}
                filename={uploadedFile?.name}
                onRemove={handleRemoveFile}
                videoUrl={videoUrl || undefined}
                mimeType={uploadedFile?.type} />

              {/* Hidden file input for click-to-upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="sr-only" />
            </div>
          </div>

          <div className="flex flex-col items-start">
            <h2 className="text-sm font-semibold text-foreground text-left">
              {title}
            </h2>

            <p className="text-xs text-muted-foreground text-left">
              {description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
