
import MyHome from "../component/dashboardHome/home";
import Recording from "../component/videoChat/Recording";
import VideoCall from "../component/videoChat/VideoCall";

//component path END

export const RouteData = [

    // Dashbord Content
    { path: `${import.meta.env.BASE_URL}home`, element: <MyHome />, title: '' },
    { path: `${import.meta.env.BASE_URL}dashbord`, element: <MyHome />, title: '' },

    // Video Chat Content
    { path: `${import.meta.env.BASE_URL}video-call`, element: <VideoCall />, title: '' },
    // { path: `${import.meta.env.BASE_URL}room-page/:roomId`, element: <RoomPage />, title: '' },
    { path: `${import.meta.env.BASE_URL}recording`, element: <Recording />, title: '' },


]
