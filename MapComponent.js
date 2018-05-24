
import React, {Component} from 'react';
import {Text, Dimensions, View} from 'react-native';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = 'AIzaSyByi1CK3yo1PYtBuqblKZb3IDjpiZCvJWw';

class PlaceAutocompleteInput extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <GooglePlacesAutocomplete
                placeholder='Search'
                minLength={2} // minimum length of text to search
                autoFocus={false}
                returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                listViewDisplayed='auto'    // true/false/undefined
                fetchDetails={true}
                renderDescription={row => row.description} // custom description render
                onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                    this.props.onPress && this.props.onPress(data, details);
                }}

                getDefaultValue={() => ''}

                query={{
                    // available options: https://developers.google.com/places/web-service/autocomplete
                    key: GOOGLE_MAPS_APIKEY,
                    language: 'vi', // language of the results
                    types: 'geocode' // default: 'geocode'
                }}

                styles={{
                    textInputContainer: {
                        width: '100%'
                    },
                    description: {
                        fontWeight: 'bold'
                    },
                    predefinedPlacesDescription: {
                        color: '#1faadb'
                    }
                }}

                // currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
                // currentLocationLabel="Current location"
                nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                GoogleReverseGeocodingQuery={{
                    // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                }}
                GooglePlacesSearchQuery={{
                    // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                    rankby: 'distance',
                    types: 'food'
                }}

                filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
                // predefinedPlaces={[homePlace, workPlace]}

                debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                renderLeftButton={()  => <Text style={{marginTop: 10, marginLeft: 5}}>{this.props.label}</Text> }
            />
        )
    }
}

export default class MapComponent extends Component {

    constructor(props) {
        super(props);

        // AirBnB's Office, and Apple Park
        this.state = {
            coordinates: [
                {
                    latitude: 37.3317876,
                    longitude: -122.0054812,
                },
                {
                    latitude: 37.771707,
                    longitude: -122.4053769,
                },
            ],
        };

        this.state.from_lat = 37.3317876;
        this.state.from_lng = -122.0054812;

        this.mapView = null;
    }

    // @ref https://developers.google.com/places/web-service/details
    onPress(type, data, details) {
        this.setState({data, details});
        let full_address = details.formatted_address;
        let lat = details.geometry.location.lat;
        let lng = details.geometry.location.lng;
        if(type === 'from')
            this.setState({full_address, from_lat: lat, from_lng: lng});
        if(type === 'to')
            this.setState({full_address, to_lat: lat, to_lng: lng});
    }

    render() {
        return (

            <View style={this.props.style}>
                <PlaceAutocompleteInput label={"From"} onPress={(data, details) => this.onPress('from',data, details)}/>
                <PlaceAutocompleteInput label={"To"} onPress={(data, details) => this.onPress('to',data, details)}/>
                {
                    this.state.distance && this.state.duration &&
                       <Text>Distance: {Math.round(this.state.distance * 10) / 10}km, Time: {Math.round(this.state.duration)}min</Text>
                }
                <View style={{width: width, height: height}}>
                    <MapView
                        style={{height: height - 200, width: width}}
                        ref={c => this.mapView = c}
                        region={{
                            latitude: this.state.from_lat,
                            longitude: this.state.from_lng,
                            latitudeDelta: 0.015,
                            longitudeDelta: 0.0121,
                        }}
                    >
                        <MapView.Marker coordinate={{latitude: this.state.from_lat, longitude: this.state.from_lng}} />
                        {
                            this.state.to_lat && this.state.to_lng &&
                            <MapView.Marker coordinate={{latitude: this.state.to_lat, longitude: this.state.to_lng}} />
                        }
                        {
                            this.state.to_lat && this.state.to_lng &&
                            <MapViewDirections
                                origin={{latitude: this.state.from_lat, longitude: this.state.from_lng}}
                                waypoints={{latitude: this.state.from_lat, longitude: this.state.from_lng}}
                                destination={{latitude: this.state.to_lat, longitude: this.state.to_lng}}
                                apikey={GOOGLE_MAPS_APIKEY}
                                strokeWidth={10}
                                strokeColor="hotpink"
                                onStart={(params) => {
                                    console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                                }}
                                onReady={(result) => {
                                    this.setState({distance: result.distance, duration: result.duration});
                                    this.mapView.fitToCoordinates(result.coordinates, {
                                        edgePadding: {
                                            right: Math.round(width / 20),
                                            bottom: Math.round(height / 20),
                                            left: Math.round(width / 20),
                                            top: Math.round(height / 20),
                                        }
                                    });
                                }}
                                onError={(errorMessage) => {
                                    alert(errorMessage);
                                }}
                            />
                        }
                    </MapView>
                </View>
            </View>
        );
    }
}
