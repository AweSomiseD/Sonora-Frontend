import { useParams } from "react-router-dom";
import PlaylistView from "../components/PlaylistView.jsx";

export default function PlaylistDetails() {
  const { id } = useParams();
  return <PlaylistView key={id} playlistId={id} />;
}
