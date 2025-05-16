import "../App.css";
import { useState } from "react";
import { ApolloClient , InMemoryCache , ApolloProvider , gql, useQuery , useMutation , useLazyQuery} from '@apollo/client';
import { useNavigate } from "react-router-dom";
import ScrollableComplaintsList from "../elements/scrollable-complaints-list";
import ScrollableAdminResponsesList from "../elements/scrollable-admin-responses-list";
import AdminResponseCard from "../elements/admin-response-card";
import ApproveButton from "../elements/approve-button";


const client  = new ApolloClient({
    uri: 'https://userservice-production-63de.up.railway.app/graphql',
    credentials: 'include',
});

export default function Complaints() {

    const navigate = useNavigate();

    const navigateToSubmitComplaints = () => {
        navigate("/submitcomplaints");
    };

    let mockComplaints = [];
    let mockAdminResponses = [];

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

    const FETCH_COMPLAINTS_QUERY = gql`
    query FetchMyComplaints {
        fetchMyComplaints {
            id
            universityId
            Subject
            Message
            createdAt
        }
    }`;

    const FETCH_ADMIN_RESPONSES_QUERY = gql`
    query FetchAdminResponsesForMyComplaints {
        fetchAdminResponsesForMyComplaints {
            id
            complaintId
            Subject
            Message
            createdAt
        }
    }`;

    const {data : fetchMyDetailsData, loading : fetchMyDetailsLoading, error : fetchMyDetailsError} = useQuery(FETCH_DETAILS_QUERY , {client: client});
    const {data : fetchMyComplaintsData, loading : fetchMyComplaintsLoading, error : fetchMyComplaintsError} = useQuery(FETCH_COMPLAINTS_QUERY , {client: client});
    const {data : fetchAdminResponsesForMyComplaintsData, loading : fetchAdminResponsesForMyComplaintsLoading, error : fetchAdminResponsesForMyComplaintsError} = useQuery(FETCH_ADMIN_RESPONSES_QUERY , {client: client});

    if(fetchMyDetailsLoading || fetchMyComplaintsLoading || fetchAdminResponsesForMyComplaintsLoading)
    {
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>LOADING...</div>
            </div>
        );
    }
    if(fetchMyDetailsError || fetchMyComplaintsError || fetchAdminResponsesForMyComplaintsError)
    {
        console.log("fetchMyDetailsError Error is:" , fetchMyDetailsError);
        console.log("fetchMyComplaintsError Error is:" , fetchMyComplaintsError);
        console.log("fetchAdminResponsesForMyComplaintsError Error is:" , fetchAdminResponsesForMyComplaintsError);
        if(fetchMyDetailsError.message === 'Unauthorized' || fetchMyComplaintsError.message === 'Unauthorized' || fetchAdminResponsesForMyComplaintsError.message === 'Unauthorized')
        {
            return (
                <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                    <div style={{width: 900, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>You are Unauthorized to access this page</div>
                </div>
            );
        }
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>ERROR</div>
            </div>
        );
    }

    const user = fetchMyDetailsData.fetchMyDetails;
    const userId = JSON.stringify(user.universityId);

    fetchMyComplaintsData.fetchMyComplaints.forEach(complaint => {
        const complaintSubject = complaint.Subject;
        const complaintMessage = complaint.Message;
        const complaintCreatedAt = complaint.createdAt;
        mockComplaints.push({id: complaint.id , Subject: complaintSubject , Message: complaintMessage , createdAt: complaintCreatedAt});
    });

    fetchAdminResponsesForMyComplaintsData.fetchAdminResponsesForMyComplaints.forEach(adminResponse => {
        const adminResponseSubject = adminResponse.Subject;
        const adminResponseMessage = adminResponse.Message;
        const adminResponseCreatedAt = adminResponse.createdAt;
        mockAdminResponses.push({id: adminResponse.id , complaintId: adminResponse.complaintId , Subject: adminResponseSubject , Message: adminResponseMessage , createdAt: adminResponseCreatedAt});
    });

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
            <div style={{width: 1000, height: 115, left: '12%', top: 180, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Complaints</div>
            <div style={{width: 1000, height: 115, left: '12%', top: 340, position: 'absolute', color: 'black', fontSize: 60, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Your Complaints</div>
            <ScrollableComplaintsList complaints={mockComplaints} />
            <div style={{width: 1000, height: 115, left: '12%', top: 1300, position: 'absolute', color: 'black', fontSize: 60, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Admin Responses to You</div>
            <ScrollableAdminResponsesList adminResponses={mockAdminResponses} />
            <ApproveButton label={'Submit a Complaint'} size={'wide'} functionToCall={() => {navigateToSubmitComplaints()}} topPosition={350} leftPosition={900}/>
        </div>
    )
}