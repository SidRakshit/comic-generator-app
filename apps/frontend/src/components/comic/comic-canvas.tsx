// src/components/comic/comic-canvas.tsx
"use client";

import Image from "next/image";
import { Panel, UI_CONSTANTS, SEMANTIC_COLORS, INTERACTIVE_STYLES } from "@repo/common-types";
import { Loader2, ImageOff, Plus, Edit, MessageSquare } from "lucide-react";

interface ComicCanvasProps {
	panels: Panel[];
	onPanelClick: (index: number) => void;
	onEditPanelClick: (index: number) => void;
	onAnnotatePanelClick?: (index: number) => void;
	layout: string | null;
}

const getGridClass = (layout: string | null, panels: Panel[]): string => {
	switch (layout) {
		case "grid-2x2":
			return "grid-cols-2 grid-rows-2";
		case "grid-3x2":
			return "grid-cols-3 grid-rows-2";
		case "single":
			return "grid-cols-1";
		case "grid-3x3":
			return "grid-cols-3 grid-rows-3";
		case "manga":
			return "grid-cols-2 manga-layout";
		default:
			const count = panels.length;
			if (count <= 1) return "grid-cols-1";
			if (count <= 4) return "grid-cols-2 grid-rows-2";
			if (count <= 6) return "grid-cols-3 grid-rows-2";
			if (count <= 9) return "grid-cols-3 grid-rows-3";
			return "grid-cols-2 grid-rows-2";
	}
};

export default function ComicCanvas({
	panels,
	onPanelClick,
	onEditPanelClick,
	onAnnotatePanelClick,
	layout,
}: ComicCanvasProps) {
	const gridClass = getGridClass(layout, panels);

	return (
		<div className="comic-canvas w-full max-w-3xl mx-auto">
			<div className={`grid ${gridClass} gap-2 md:gap-4 mb-4`}>
				{panels.map((panel, index) => (
					<ComicPanel
						key={panel.id || index}
						panel={panel}
						panelNumber={index + 1}
						onClick={() => onPanelClick(index)}
						onEditClick={() => onEditPanelClick(index)}
						onAnnotateClick={() => onAnnotatePanelClick?.(index)}
					/>
				))}
			</div>
		</div>
	);
}

interface ComicPanelProps {
	panel: Panel;
	panelNumber: number;
	onClick: () => void;
	onEditClick: () => void;
	onAnnotateClick?: () => void;
}

function ComicPanel({
	panel,
	panelNumber,
	onClick,
	onEditClick,
	onAnnotateClick,
}: ComicPanelProps) {
	return (
		<div
			className={`
        group aspect-square border-2 ${UI_CONSTANTS.BORDER_RADIUS.MEDIUM} overflow-hidden cursor-pointer relative
        ${
					panel.status === "loading"
						? `${SEMANTIC_COLORS.BORDER.ACCENT_LIGHT} ${SEMANTIC_COLORS.BACKGROUND.ACCENT_LIGHT}`
						: panel.status === "error"
						? "border-red-400 bg-red-50"
						: panel.status === "complete"
						? "border-green-400"
						: `${SEMANTIC_COLORS.BORDER.DEFAULT} ${SEMANTIC_COLORS.BACKGROUND.SECONDARY} ${INTERACTIVE_STYLES.BORDER.HOVER_ACCENT_LIGHT}`
				}
      `}
			onClick={onClick}
		>
			{panel.status === "loading" ? (
				<div className="flex flex-col items-center justify-center h-full pointer-events-none">
					<Loader2 className={`h-8 w-8 md:h-10 md:w-10 ${SEMANTIC_COLORS.TEXT.ACCENT} animate-spin mb-1 md:mb-2`} />
					<p className={`text-xs md:text-sm ${SEMANTIC_COLORS.TEXT.ACCENT}`}>Generating...</p>
				</div>
			) : panel.status === "error" ? (
				<div className="flex flex-col items-center justify-center h-full text-center p-1 md:p-2">
					<ImageOff className="h-8 w-8 md:h-10 md:w-10 text-red-500 mb-1 md:mb-2" />
					<p className="text-xs md:text-sm text-red-500">
						{panel.error || "Error"}
					</p>
					<p className="text-xs text-red-400 mt-1">Click to try again</p>
				</div>
			) : panel.status === "complete" && panel.imageUrl ? (
				<>
					<div className="relative h-full w-full">
						<Image
							src={panel.imageUrl}
							alt={`Panel ${panelNumber}`}
							fill
							style={{ objectFit: "cover" }}
							sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
							priority={panelNumber <= 4}
							className="pointer-events-none"
							unoptimized={true}
						/>
					</div>
					<div className="absolute top-1 right-1 md:top-2 md:right-2 z-10 flex gap-1">
						{onAnnotateClick && (
							<button
								type="button"
								className={`p-1 md:p-1.5 ${SEMANTIC_COLORS.BACKGROUND.OVERLAY} ${SEMANTIC_COLORS.TEXT.INVERTED} ${UI_CONSTANTS.BORDER_RADIUS.FULL} opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-opacity-75`}
								onClick={(e) => {
									e.stopPropagation();
									onAnnotateClick();
								}}
								aria-label={`Annotate Panel ${panelNumber}`}
								title={`Annotate Panel ${panelNumber}`}
							>
								<MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
							</button>
						)}
						<button
							type="button"
							className={`p-1 md:p-1.5 ${SEMANTIC_COLORS.BACKGROUND.OVERLAY} ${SEMANTIC_COLORS.TEXT.INVERTED} ${UI_CONSTANTS.BORDER_RADIUS.FULL} opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-opacity-75`}
							onClick={(e) => {
								e.stopPropagation();
								onEditClick();
							}}
							aria-label={`Edit Panel ${panelNumber}`}
							title={`Edit Panel ${panelNumber}`}
						>
							<Edit className="h-3 w-3 md:h-4 md:w-4" />
						</button>
					</div>
				</>
			) : (
				<div className="flex flex-col items-center justify-center h-full">
					<div className="mb-1 md:mb-2">
						
						<Plus className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
					</div>
					<p className="text-xs md:text-sm text-gray-500">
						Panel {panelNumber}
					</p>
					<p className="text-xs text-gray-400 mt-1">Click to add content</p>
				</div>
			)}
		</div>
	);
}
