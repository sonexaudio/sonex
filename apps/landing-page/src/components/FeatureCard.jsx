const FeatureCard = ({ feature, textDirection = "left" }) => {
	return (
		<article className="grid grid-cols-2 justify-center items-center place-items-center">
			{textDirection === "left" ? (
				<>
					<div>
						<h3 className="text-3xl leading-[1] tracking-tighter font-bold max-w-80">
							{feature.title}
						</h3>
						<p className="tracking-tighter text-lg text-neutral-500 max-w-80">
							{feature.description}
						</p>
					</div>
					<div>
						<img src={feature.imgLink} alt={feature.description} />
					</div>
				</>
			) : (
				<>
					<div>
						<img src={feature.imgLink} alt={feature.description} />
					</div>
					<div>
						<h3 className="text-3xl leading-[1] tracking-tighter font-bold max-w-80">
							{feature.title}
						</h3>
						<p className="tracking-tighter text-lg text-neutral-500 max-w-80">
							{feature.description}
						</p>
					</div>
				</>
			)}
		</article>
	);
};

export default FeatureCard;
