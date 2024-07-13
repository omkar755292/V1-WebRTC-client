import React from "react";

//Svg icons of Dashboard

const Dashboardsvg = <i className="ri-home-8-line side-menu__icon"></i>

const WidgetsSvg = <i className="ri-apps-2-line side-menu__icon"></i>

const ComponentsSvg = <i className="ri-inbox-line side-menu__icon"></i>

const ElementsSvg = <i className="ri-cpu-line side-menu__icon"></i>

const FormsSvg = <i className="ri-file-text-line side-menu__icon"></i>

const AdvancedUISvg = <i className="ri-stack-line side-menu__icon"></i>

const BasicUISvg = <i className="ri-file-list-3-line side-menu__icon"></i>

const NestedSvg = <i className="ri-node-tree side-menu__icon"></i>

const MapsSvg = <i className="ri-map-pin-user-line side-menu__icon"></i>

const ChartsSvg = <i className="ri-pie-chart-2-line side-menu__icon"></i>

const PagesSvg = <i className="ri-book-open-line side-menu__icon"></i>

const IconsSvg = <i className="ri-camera-lens-line side-menu__icon"></i>

const AuthenticationSvg = <i className="ri-error-warning-line side-menu__icon"></i>



export const MenuItems = [
	{
		id: 1, menutitle: "MAIN", Items: [


			{
				id: 2,
				path: `${import.meta.env.BASE_URL}dashbord`,
				icon: Dashboardsvg,
				title: 'Dashboard',
				type: 'link',
				active: false,
				selected: false

			},
			{
				id: 5,
				icon: Dashboardsvg,
				title: 'Video Chat',
				type: 'sub',
				active: false,
				selected: false,
				children: [
					{
						id: 3,
						path: `${import.meta.env.BASE_URL}video-call`,
						type: 'link',
						active: false,
						selected: false,
						title: 'Video Call'
					},
					{
						id: 4,
						path: `${import.meta.env.BASE_URL}recording`,
						type: 'link',
						active: false,
						selected: false,
						title: 'Recordings'
					}
				]
			},
		]
	},

];
export default MenuItems
