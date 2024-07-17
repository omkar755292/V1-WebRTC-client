import React, { Fragment } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.scss";
import { RouteData } from "./common/routingData";
import { HelmetProvider } from 'react-helmet-async';

import App from "./layout/App";

import MyHome from "./component/dashboardHome/home";


import Error404 from "./component/errorpage/Error404/error404";

import Firebaselayout from "./layout/firebase/firebaselayout";

import ScrollToTop from "./ScrollToTop/ScrolltoTop";
import Firebaselogin from "./layout/firebase/firebaselogin";
import { PeerContextProvider } from "./component/videoChat/PeerContext";
import { SocketContextProvider } from "./component/videoChat/SocketContext";
import RoomLayout from "./component/videoChat/roomlayout";
import { PeerProvider } from "./component/videoChat/usePeer";

const helmetContext = {};

ReactDOM.createRoot(document.getElementById("root")).render(
	<Fragment>
		<SocketContextProvider>
			<PeerProvider>


				<HelmetProvider context={helmetContext}>
					<BrowserRouter>
						<ScrollToTop />
						<Routes>

							<Route path={`${import.meta.env.BASE_URL}`} element={<Firebaselayout />}>
								<Route index element={<Firebaselogin />} />
								<Route path={`${import.meta.env.BASE_URL}login`} element={<Firebaselogin />} />

							</Route>

							{RouteData.map((idx) => (
								<Fragment key={Math.random()}>
									{/* //Main page */}
									<Route path={`${import.meta.env.BASE_URL}`} element={<App />}>
										<Route index element={<MyHome />} />
										<Route exact path={idx.path} element={idx.element} />
									</Route>

									<Route path="*" element={<Error404 />} />

								</Fragment>
							))}

							{/* Room route */}
							<Route path="/room/:roomId" element={<RoomLayout />} />

						</Routes>
					</BrowserRouter>
				</HelmetProvider>
			</PeerProvider>
		</SocketContextProvider>
	</Fragment>,
);
