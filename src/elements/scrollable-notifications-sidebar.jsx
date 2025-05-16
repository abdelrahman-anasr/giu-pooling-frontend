import "../App.css";
import NotificationSidebarCard from "../elements/notifications-sidebar-card";

export default function ScrollableNotificationsSidebar({notifications , selectFunction}){
    let firstTime = true;
    let percent = 0;
    return (
        <div style={{width: '30%', height: '100%', flexDirection: 'column', overflowY: 'auto', position: 'absolute', top: 0, left: 0, background: '#a3a3a3' , borderRadius: 10}}>
        {notifications.map((notification) => {  
            if(firstTime)
            {
                percent = 4;
                firstTime = false;
            }
            else
            {
                percent += 40;
            }
            return <NotificationSidebarCard thisNotification={notification} subject={notification.subject} message={notification.message} opened={notification.opened} createdAt={notification.createdAt} percentTop={percent + '%'} functionToCall={selectFunction} />
        })}

        </div>
    );
}