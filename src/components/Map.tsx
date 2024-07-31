'use client';

import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useContext } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { CarContext, RSUContext, ReportContext } from './LayoutWrapper';

export default function Map() {
	const { isLoaded: isMapReady } = useLoadScript({
		googleMapsApiKey:
			process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '<GOOGLE-MAP-KEY>',
	});

	const car = useContext(CarContext);
	const rsu = useContext(RSUContext);
	const reports = useContext(ReportContext);
	
	const carLocation = {
		lat: car.latitude,
		lng: car.longitude,
	} as google.maps.LatLngLiteral;
	const rsuLocation = {
		lat: rsu.latitude,
		lng: rsu.longitude,
	} as google.maps.LatLngLiteral;

	if (!isMapReady) return <TailSpin color="#17A5D3" height={80} width={80} />;

	return (
		<GoogleMap
			mapContainerClassName="z-0 h-full w-full rounded-md"
			zoom={14}
			center={carLocation}
			options={{ disableDefaultUI: true }}
		>
			{reports.map((report, index) => {
				
				const reportLocation = {
					lat: report.latitude,
					lng: report.longitude,
				} as google.maps.LatLngLiteral;
				const url =
					report.type === 'CLOSED ROAD'
						? '/closed_road_pin.svg'
						: report.type === 'ACCIDENT'
						? '/accident_pin.svg'
						: report.type === 'CONSTRUCTION'
						? '/construction_pin.svg'
						: report.type === 'TRAFFIC CONGESTION'
						? '/traffic_jam_pin.svg'
						: '';

				return (
					<Marker
						key={report.type.replace(' ', '')+index}
						icon={{
							url: url,
							scaledSize: new google.maps.Size(124, 124),
						}}
						position={reportLocation}
					/>
				);
			})}
			{rsuLocation.lat && rsuLocation.lng && (
				<Marker
					icon={{
						url: '/rsu_pin.svg',
						scaledSize: new google.maps.Size(124, 124),
					}}
					position={rsuLocation}
				/>
			)}
			{carLocation.lat && carLocation.lng && (
				<Marker
					icon={{
						url: '/car_pin' + `${car.driveMode == 'autonomous'?'_av.svg':'.svg'}`,
						scaledSize: new google.maps.Size(124, 124),
					}}
					position={carLocation}
				/>
			)}
		</GoogleMap>
	);
}
