// src/components/comic/comic-metadata-form.tsx
import React, { ChangeEvent } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Plus } from "lucide-react";
import CharacterInput from "./character-input";
import { Comic, SEMANTIC_COLORS } from "@repo/common-types";

interface ComicMetadataFormProps {
	comic: Comic; // Use the imported Comic type
	onMetadataChange: (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => void;
	onCharacterChange: (
		id: string,
		field: "name" | "description",
		value: string
	) => void;
	onAddCharacter: () => void;
	onRemoveCharacter: (id: string) => void;
	onNextStep: () => void;
}

export default function ComicMetadataForm({
	comic,
	onMetadataChange,
	onCharacterChange,
	onAddCharacter,
	onRemoveCharacter,
	onNextStep,
}: ComicMetadataFormProps) {
	// Rest of the component code remains the same...
	return (
		<div>
			<h2 className={`text-xl font-semibold mb-4 ${SEMANTIC_COLORS.TEXT.PRIMARY}`}>
				1. Enter Comic Details
			</h2>
			<div className="space-y-4">
				{/* Title */}
				<div>
					<Label htmlFor="title" className={`${SEMANTIC_COLORS.TEXT.PRIMARY}`}>
						Title
					</Label>
					<Input
						id="title"
						name="title"
						value={comic.title}
						onChange={onMetadataChange}
						placeholder="Your Awesome Comic Title"
						required
					/>
				</div>
				{/* Genre */}
				<div>
					<Label htmlFor="genre" className={`${SEMANTIC_COLORS.TEXT.PRIMARY}`}>
						Genre (Optional)
					</Label>
					<Input
						id="genre"
						name="genre"
						value={comic.genre || ""}
						onChange={onMetadataChange}
						placeholder="e.g., Superhero, Sci-Fi, Slice of Life"
					/>
				</div>
				{/* Description */}
				<div>
					<Label htmlFor="description" className={`${SEMANTIC_COLORS.TEXT.PRIMARY}`}>
						Description (Optional)
					</Label>
					<Textarea
						id="description"
						name="description"
						value={comic.description || ""}
						onChange={onMetadataChange}
						placeholder="Brief description of your comic"
					/>
				</div>

				{/* Characters */}
				<div>
					<h3 className={`text-lg font-semibold mb-2 border-t pt-4 ${SEMANTIC_COLORS.TEXT.PRIMARY}`}>
						Characters
					</h3>
					{comic.characters?.map((char, index) => (
						<CharacterInput
							key={char.id}
							character={char}
							index={index}
							onCharacterChange={onCharacterChange}
							onRemoveCharacter={onRemoveCharacter}
							canRemove={(comic.characters?.length ?? 0) > 1}
						/>
					))}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onAddCharacter}
						className={`${SEMANTIC_COLORS.TEXT.PRIMARY}`}
					>
						<Plus className={`h-4 w-4 mr-1 ${SEMANTIC_COLORS.TEXT.INVERTED}`} /> 
						<span className={`${SEMANTIC_COLORS.TEXT.INVERTED}`}>Add Character</span>
					</Button>
				</div>
			</div>
			{/* Navigation Button */}
			<div className="mt-6 text-right">
				<Button onClick={onNextStep} className={`${SEMANTIC_COLORS.TEXT.PRIMARY}`}>
					Next: Choose Template
				</Button>
			</div>
		</div>
	);
}
