import "../App.css";
import { ApolloClient , InMemoryCache , ApolloProvider , gql, useQuery , useMutation , useLazyQuery} from '@apollo/client';
import { useSearchParams } from "react-router-dom";

const client = new ApolloClient({
  uri: 'https://userservice-production-63de.up.railway.app/graphql',
  cache: new InMemoryCache(),
  credentials: 'include',
});

export default function VerifyAccount() {

  const [searchParams , setSearchParams] = useSearchParams();

  const code = searchParams.get('code');

  const codeNumber = parseInt(code);

  console.log("Code is:" , code);

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

  const VERIFY_ACCOUNT_QUERY = gql`
  query VerifyAccount($Code: Int!) {
    verifyAccount(code: $Code) {
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

  const {data : fetchMyDetailsData, loading : fetchMyDetailsLoading, error : fetchMyDetailsError} = useQuery(FETCH_DETAILS_QUERY , {client: client});

  const {data : verifyAccountData, loading : verifyAccountLoading, error : verifyAccountError} = useQuery(VERIFY_ACCOUNT_QUERY , {client: client, variables: {Code: codeNumber}});

  if(fetchMyDetailsLoading)
  {
    return (
      <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
        <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>LOADING...</div>
      </div>
    );
  }
  if(fetchMyDetailsError)
  {
    console.log("Fetch my details error is:" , fetchMyDetailsError);
    if(fetchMyDetailsError.message === 'Unauthorized')
    {
      return (
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
          <div style={{width: 950, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>You are Unauthorized to access this page</div>
        </div>
      );
    }
    return (
      <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
        <div style={{width: 950, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>ERROR</div>
      </div>
    );
  }


    if(verifyAccountLoading)
    {
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>LOADING...</div>
            </div>
        );
    }
    
    if(verifyAccountError)
    {
        console.log("Verify account error is:" , verifyAccountError);
        if(verifyAccountError.message === 'Unauthorized')
        {
            return (
                <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                    <div style={{width: 950, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>You are Unauthorized to access this page</div>
                </div>
            );
        }
        if(verifyAccountError.message === 'Wrong Code')
        {
            return (
                <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                    <div style={{width: 950, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Code is not valid</div>
                </div>
            );
        }

        if(verifyAccountError.message === 'User already verified')     
        {
            return (
                <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                    <div style={{width: 950, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Email is already Verified</div>
                </div>
            );
        }

        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 950, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>ERROR</div>
            </div>
        );
    }

    return(
        
    <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
        <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Email has been Verified</div>
    </div>
    );

}