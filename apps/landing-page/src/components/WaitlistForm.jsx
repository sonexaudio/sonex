import React from "react";
import { useState } from "react";
import { Input } from "./ui/input";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import MultipleSelector from "./MultipleSelector";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

const options = [
	{ label: "Music Producer", value: "producer" },
	{ label: "Audio Engineer", value: "engineer" },
	{ label: "Mixing Engineer", value: "mixing_engineer" },
	{ label: "Mastering Engineer", value: "mastering_engineer" },
	{ label: "Recording Engineer", value: "recording_engineer" },
	{ label: "Sound Designer", value: "sound_designer" },
	{ label: "Podcast Editor", value: "podcast_editor" },
	{ label: "Foley Artist", value: "foley_artist" },
	{ label: "Voiceover Artist", value: "voiceover_artist" },
	{ label: "Session Musician", value: "session_musician" },
	{ label: "Singer/Songwriter", value: "singer_songwriter" },
	{ label: "Composer (Film/TV/Game)", value: "composer" },
	{ label: "Live Sound Engineer", value: "live_sound_engineer" },
	{ label: "Game Audio Designer", value: "game_audio_designer" },
	{ label: "ADR Editor", value: "adr_editor" },
	{ label: "Music Supervisor", value: "music_supervisor" },
	{ label: "Audio Post Engineer", value: "post_audio_engineer" },
	{ label: "Broadcast Engineer", value: "broadcast_engineer" },
	{ label: "Audiobook Editor", value: "audiobook_editor" },
	{ label: "Field Recordist", value: "field_recordist" },
	{ label: "Other", value: "other" },
];

const WaitlistForm = () => {
	const [formData, setFormData] = useState({
		email: "",
		firstName: "",
		agreesToTerms: false,
	});
	const [openDialog, setOpenDialog] = useState(false);
	const [professions, setProfessions] = useState([]);

	const handleUpdateFormData = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleOpenDialog = () => {
		if (formData.email) {
			setOpenDialog(true);
		} else {
			alert("Please enter your email first.");
		}
	};

	return (
		<form className="w-full space-y-4">
			<Input
				name="email"
				placeholder="email@sonex.app"
				value={formData.email}
				onChange={handleUpdateFormData}
			/>
			<Button className="w-full" onClick={handleOpenDialog} type="button">
				Enter your email for an early discount
			</Button>
			<Dialog open={openDialog} onOpenChange={setOpenDialog}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Great! {formData.email}!</DialogTitle>
						<DialogDescription>Just a few more questions</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<Input
							name="firstName"
							placeholder="John Doe"
							value={formData.firstName}
							onChange={handleUpdateFormData}
						/>
						<MultipleSelector
							defaultOptions={options}
							placeholder="I am a.."
							value={professions}
							onChange={setProfessions}
							emptyIndicator={
								<p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
									no results found.
								</p>
							}
						/>
						<label htmlFor="agreesToTerms" className="flex gap-2 items-center">
							<Checkbox
								name="agreesToTerms"
								value={formData.agreesToTerms}
								onChange={handleUpdateFormData}
							/>
							I agree to{" "}
							<a href="#" className="underline text-blue-600">
								terms and conditions
							</a>
						</label>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="ghost">Cancel</Button>
						</DialogClose>
						<Button>Submit</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</form>
	);
};

export default WaitlistForm;
