"use client";

import React from "react";
import { Button } from "@repo/ui/button";
import { Modal } from "@repo/ui/modal";
import { Clock, FileText, Trash2 } from "lucide-react";
import type { Comic } from "@repo/common-types";
import { SEMANTIC_COLORS } from "@repo/common-types";

/**
 * Props for the DraftRecoveryModal component
 */
interface DraftRecoveryModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to call when user chooses to restore the draft */
  onRestore: (draft: Comic) => void;
  /** Function to call when user chooses to discard the draft */
  onDiscard: () => void;
  /** The draft comic data */
  draft: Comic | null;
  /** Draft metadata (timestamp, size, etc.) */
  draftInfo?: {
    timestamp: Date;
    size: number;
    isExpired: boolean;
  } | null;
}

/**
 * Modal component for recovering draft comics from localStorage
 * Shows when a user has unsaved work from a previous session
 */
export function DraftRecoveryModal({
  isOpen,
  onRestore,
  onDiscard,
  draft,
  draftInfo,
}: DraftRecoveryModalProps) {
  if (!isOpen || !draft) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  };

  const handleRestore = () => {
    onRestore(draft);
  };

  const handleDiscard = () => {
    onDiscard();
  };

  return (
    <Modal isOpen={isOpen} onClose={onDiscard}>
      <div className="p-6 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-4">
          <FileText className="h-6 w-6 text-blue-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">
            Recover Draft
          </h2>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            We found a draft of your comic from a previous session. Would you like to restore it?
          </p>

          {/* Draft Info */}
          <div className={`bg-gray-50 rounded-lg p-4 mb-4 ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">
                {draft.title || "Untitled Comic"}
              </h3>
              {draftInfo?.isExpired && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Expired
                </span>
              )}
            </div>
            
            <div className="text-sm text-gray-500 space-y-1">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {draftInfo ? formatTimeAgo(draftInfo.timestamp) : "Unknown time"}
              </div>
              
              {draftInfo && (
                <div className="text-xs">
                  Size: {formatFileSize(draftInfo.size)}
                </div>
              )}
              
              <div className="text-xs">
                Template: {draft.template || "None"} • Panels: {draft.panels?.length || 0}
              </div>
            </div>
          </div>

          {/* Warning for expired drafts */}
          {draftInfo?.isExpired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-sm text-yellow-800">
                This draft is older than 7 days and may be outdated. Consider starting fresh if the content is no longer relevant.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleDiscard}
            className="flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Start Fresh
          </Button>
          <Button
            onClick={handleRestore}
            className="flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Restore Draft
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Simplified version for basic usage
 */
export function DraftRecoveryModalSimple({
  isOpen,
  onRestore,
  onDiscard,
  draft,
}: Omit<DraftRecoveryModalProps, "draftInfo">) {
  return (
    <DraftRecoveryModal
      isOpen={isOpen}
      onRestore={onRestore}
      onDiscard={onDiscard}
      draft={draft}
      draftInfo={null}
    />
  );
}
