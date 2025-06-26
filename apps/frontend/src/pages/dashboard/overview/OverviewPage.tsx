import { useEffect } from "react";
import { useComments } from "../../../hooks/useComments";
import { CommentCard } from "../files/[name]/CommentView";
import PageLayout from "../../../components/PageLayout";

const OverviewPage = () => {
	const { getComments, comments: { allComments } } = useComments();

	useEffect(() => {
		getComments();
	}, []);

	return (
		<PageLayout>
			<div>
				<div className="grid grid-cols-3 gap-4">
					<div className="border rounded p-4">
						<h3>Comments</h3>
						{allComments.map(comment => (
							<CommentCard key={comment.id} comment={comment} />
						))}
					</div>

					<div className="border rounded p-4">Activities Here</div>
					<div className="border rounded p-4">Payments Here</div>
				</div>
			</div>
		</PageLayout>

	);
};
export default OverviewPage;
