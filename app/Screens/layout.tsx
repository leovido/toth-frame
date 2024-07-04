"use client";

import React from "react";
import { ScreenState, useApp } from "../Context/AppContext";
import Button from "../components/Button";
import Signout from "../components/icons/Signout";
// import useLocalStorage from "../hooks/use-local-storage-state";
// import { UserInfo } from "../types";
import Link from "next/link";
import { ReactNode } from "react";

interface Props {
	children: ReactNode;
}

const ScreenLayout = ({ children }: Props) => {
	const { screen } = useApp();
	// const [_, removeItem] = useLocalStorage<UserInfo>("user");

	const handleSignout = () => {
		// removeItem();
		window.location.reload();
	};

	return (
		<div className="flex flex-col min-h-screen text-white">
			<header className="flex justify-between items-center p-5">
				{screen !== ScreenState.Signin && (
					<div className="flex items-center">
						<Button
							onClick={handleSignout}
							title="Sign Out"
							rightIcon={<Signout height="20px" width="20px" />}
						/>
					</div>
				)}
			</header>
			{children}
			<footer className="flex flex-col justify-center items-center gap-y-6 text-center p-4">
				<Link href="https://warpcast.com/~/channel/tipothehat" target="_blank">
					Visit TOTH @ Warpcast for more
				</Link>
			</footer>
		</div>
	);
};

export default ScreenLayout;
