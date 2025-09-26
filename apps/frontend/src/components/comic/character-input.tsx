// src/components/comic/character-input.tsx
import React, { ChangeEvent } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Trash2 } from "lucide-react";
// *** FIX: Import type directly from the hook file ***
import { ComicCharacter, SEMANTIC_COLORS } from "@repo/common-types";

interface CharacterInputProps {
	character: ComicCharacter; // Use the imported type
	index: number;
	onCharacterChange: (
		id: string,
		field: "name" | "description",
		value: string
	) => void;
	onRemoveCharacter: (id: string) => void;
	canRemove: boolean;
}

export default function CharacterInput({
	character,
	index,
	onCharacterChange,
	onRemoveCharacter,
	canRemove,
}: CharacterInputProps) {
	// Rest of the component code remains the same...
	return (
		<div
			key={character.id}
			className={`p-3 border rounded mb-3 space-y-2 relative ${SEMANTIC_COLORS.BACKGROUND.SECONDARY}`}
		>
			<Label className={`font-medium ${SEMANTIC_COLORS.TEXT.PRIMARY}`}>Character {index + 1}</Label>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
				<div>
					<Label
						htmlFor={`char-name-${character.id}`}
						className="text-sm text-gray-700"
					>
						Name
					</Label>
					<Input
						id={`char-name-${character.id}`}
						value={character.name}
						onChange={(e) =>
							onCharacterChange(character.id, "name", e.target.value)
						}
						placeholder="Character Name"
					/>
				</div>
				<div>
					<Label
						htmlFor={`char-desc-${character.id}`}
						className="text-sm text-gray-700"
					>
						Description
					</Label>
					<Input
						id={`char-desc-${character.id}`}
						value={character.description}
						onChange={(e) =>
							onCharacterChange(character.id, "description", e.target.value)
						}
						placeholder="Brief description (e.g., appearance, role)"
					/>
				</div>
			</div>
			{canRemove && (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="absolute top-1 right-1 h-6 w-6 text-red-500 hover:text-red-700"
					onClick={() => onRemoveCharacter(character.id)}
					aria-label="Remove Character"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
}
