import "../App.css";
import { useEffect, useState } from "react";
import { ApolloClient , InMemoryCache , ApolloProvider , gql, useQuery , useMutation , useLazyQuery} from '@apollo/client';
import { useNavigate } from "react-router-dom";
import ScrollableComplaintsList from "../elements/scrollable-complaints-list";
import ScrollableAdminResponsesList from "../elements/scrollable-admin-responses-list";
import AdminResponseCard from "../elements/admin-response-card";
import ApproveButton from "../elements/approve-button";
import NotificationSidebarCard from "../elements/notifications-sidebar-card";
import ScrollableNotificationsSidebar from "../elements/scrollable-notifications-sidebar";


const client = new ApolloClient({
    uri: "https://userservice-production-63de.up.railway.app/graphql",
    cache: new InMemoryCache(),
    credentials: 'include'
});

const notificationClient = new ApolloClient({
    uri: "notificationservice-production-d8cf.up.railway.app/notification",
    cache: new InMemoryCache(),
    credentials: 'include'
});

export default function Notification() {

    const navigate = useNavigate();

    const [currentNotification, setCurrentNotification] = useState(null);

    let mockNotifications = [];


    const FETCH_DETAILS_QUERY = gql`
    query FetchMyDetails{
        fetchMyDetails{
            id
            name
            email
            universityId
            gender
            phoneNumber
            isEmailVerified
            role
            createdAt
            updatedAt
        }
    }`;

    const FETCH_NOTIFICATIONS_QUERY = gql`
    query FetchMyNotifications {
        fetchMyNotifications {
            id
            subject
            message
            receiverId
            opened
            createdAt
        }
    }`;

    const SET_NOTIFICATION_AS_READ_MUTATION = gql`
    mutation SetNotificationAsRead($id: Int!) {
        setNotificationAsRead(id: $id) {
            id
            subject
            message
            receiverId
            opened
            createdAt
        }
    }`;

    const {data : fetchMyDetailsData, loading : fetchMyDetailsLoading, error : fetchMyDetailsError} = useQuery(FETCH_DETAILS_QUERY , {client: client});
    const {data : fetchMyNotificationsData, loading : fetchMyNotificationsLoading, error : fetchMyNotificationsError} = useQuery(FETCH_NOTIFICATIONS_QUERY , {client: notificationClient});
    const [setNotificationAsRead , {loading : setNotificationAsReadLoading, error : setNotificationAsReadError}] = useMutation(SET_NOTIFICATION_AS_READ_MUTATION , {client: notificationClient});


    if(fetchMyDetailsLoading || fetchMyNotificationsLoading)
    {
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>LOADING...</div>
            </div>
        );
    }

    if(fetchMyDetailsError || fetchMyNotificationsError)
    {
        if(fetchMyDetailsError.message === 'Unauthorized' || fetchMyNotificationsError.message === 'Unauthorized')
        {
            return (
                <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                    <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>You are Unauthorized to access this page</div>
                </div>
            );
        }
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>ERROR</div>
            </div>
        );
    }

    const notifications = fetchMyNotificationsData.fetchMyNotifications;

    for(let i = 0; i < notifications.length; i++)
    {
        mockNotifications.push(notifications[i]);
    }

    const selectNotification = async (notification) => {
        if(notification.opened === false)
        {
            await setNotificationAsRead({variables: {id: notification.id}});
        }
        await notificationClient.refetchQueries({query: FETCH_NOTIFICATIONS_QUERY});

        setCurrentNotification(notification);
    };


    if(currentNotification === null)
    {
        return (
            <div style={{ width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 1000, height: 115, left: '12%', top: 180, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Notifications</div>
                <div style={{width: '80%' , height: 600 , position: 'absolute', top: 315, left:'10%', background: 'hsla(0, 7.70%, 94.90%, 0.86)', borderRadius: 10, border: '1px solid black'}}>
                <ScrollableNotificationsSidebar notifications={mockNotifications} selectFunction={selectNotification} />
                </div>
            </div>            
        );
    }
    else
    {
        return (
            <div style={{ width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 1000, height: 115, left: '12%', top: 180, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Notifications</div>
                <div style={{width: '80%' , height: 600 , position: 'absolute', top: 315, left:'10%', background: 'hsla(0, 7.70%, 94.90%, 0.86)', borderRadius: 10, border: '1px solid black'}}>
                <ScrollableNotificationsSidebar notifications={mockNotifications} selectFunction={selectNotification} />
                <div style={{width: 930, height: 580, top: 5, left: 420 , position: 'relative' , background: 'hsl(0, 0.00%, 100.00%)', borderRadius: 10, border: '1px solid black'}}>
                    <div style={{width: 900 , left: 0, position: 'relative', fontFamily: 'IBM Plex Sans', textAlign: 'left', fontSize: 35, fontWeight: '700', color: 'black', wordWrap: 'break-word', padding: 10}}>{currentNotification.subject}</div>
                    <div style={{width: 900 , left: 0, position: 'relative', fontFamily: 'IBM Plex Sans', textAlign: 'left', fontSize: 24, fontWeight: '700', color: 'black', wordWrap: 'break-word', padding: 10}}>{currentNotification.message}</div>
                </div>
                </div>
            </div>            
        );
    }
}