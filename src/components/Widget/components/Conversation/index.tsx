import { useRef, useState, useEffect } from 'react';
import { Picker } from 'emoji-mart';
import cn from 'classnames';

import Header from './components/Header';
import Messages from './components/Messages';
import Sender from './components/Sender';
import QuickButtons from './components/QuickButtons';
import { AnyFunction } from '../../../../utils/types';
import AudioReactRecorder, { RecordState } from 'audio-react-recorder'

import './style.scss';

interface ISenderRef {
  onSelectEmoji: (event: any) => void;
}

type Props = {
  title: string;
  subtitle: string;
  senderPlaceHolder: string;
  showCloseButton: boolean;
  disabledInput: boolean;
  autofocus: boolean;
  className: string;
  sendMessage: AnyFunction;
  toggleChat: AnyFunction;
  profileAvatar?: string;
  profileClientAvatar?: string;
  titleAvatar?: string;
  onQuickButtonClicked?: AnyFunction;
  onTextInputChange?: (event: any) => void;
  sendButtonAlt: string;
  showTimeStamp: boolean;
  resizable?: boolean;
  emojis?: boolean;
};

function Conversation({
  title,
  subtitle,
  senderPlaceHolder,
  showCloseButton,
  disabledInput,
  autofocus,
  className,
  sendMessage,
  toggleChat,
  profileAvatar,
  profileClientAvatar,
  titleAvatar,
  onQuickButtonClicked,
  onTextInputChange,
  sendButtonAlt,
  showTimeStamp,
  resizable,
  emojis
}: Props) {

  const [containerDiv, setContainerDiv] = useState<HTMLElement | null>();
  let startX, startWidth;

  useEffect(() => {
    const containerDiv = document.getElementById('rcw-conversation-container');
    setContainerDiv(containerDiv);
  }, []);

  const initResize = (e) => {
    if (resizable) {
      startX = e.clientX;
      if (document.defaultView && containerDiv){
        startWidth = parseInt(document.defaultView.getComputedStyle(containerDiv).width);
        window.addEventListener('mousemove', resize, false);
        window.addEventListener('mouseup', stopResize, false);
      }
    }
  }

  const resize = (e) => {
    if (containerDiv) {
      containerDiv.style.width = (startWidth - e.clientX + startX) + 'px';
    }
  }

  const stopResize = (e) => {
    window.removeEventListener('mousemove', resize, false);
    window.removeEventListener('mouseup', stopResize, false);
  }
  
  const [pickerOffset, setOffset] = useState(0)
  const senderRef = useRef<ISenderRef>(null!);
  const [pickerStatus, setPicket] = useState(false)
  const [listening, setListening] = useState(false)
  const [recordState, setRecordState] = useState(false);
  const [audioData, setAudioData] = useState<any>({});
  const [isRecording, setIsRecording] = useState(false)
  const [blobURL, setBlobURL] = useState("") 

 
  const onSelectEmoji = (emoji) => {
    console.log("anything")
    senderRef.current?.onSelectEmoji(emoji)
  }

  const togglePicker = () => {
    // note: 'listening' will come into this function being false, and will leave function false despite being update
    // same thing applies when 'listening' is true when it comes into the function. it will eventually get updated, so
    // don't worry about that, but beware...

    if (listening) {
      // if listening is equal to true, then the user clicked to stop recording, so stop the recording
      setRecordState(RecordState.STOP)
      console.log(`stop recording`)
    } else {
      // if listening is equal to false, then the user clicked to start recording, so start recording
      setRecordState(RecordState.START)
      console.log(`start recording`)
    }

    setListening(!listening)
    // console.log(`Listening: ${listening}`)
  }

  const handlerSendMsn = (event) => {
    sendMessage(event)
    if(pickerStatus) setPicket(false)
  }

  const onStop = (data) => {
    console.log(`audioData ${data}`)
    setAudioData(data)
  }

  return (
    <div id="rcw-conversation-container" onMouseDown={initResize} 
      className={cn('rcw-conversation-container', className)} aria-live="polite">
      {resizable && <div className="rcw-conversation-resizer" />}
      <Header
        title={title}
        subtitle={subtitle}
        toggleChat={toggleChat}
        showCloseButton={showCloseButton}
        titleAvatar={titleAvatar}
      />
      <Messages
        profileAvatar={profileAvatar}
        profileClientAvatar={profileClientAvatar}
        showTimeStamp={showTimeStamp}
      />
      <QuickButtons onQuickButtonClicked={onQuickButtonClicked} />
      {/* {emojis && pickerStatus && (<Picker 
        style={{ position: 'absolute', bottom: pickerOffset, left: '0', width: '100%' }}
        onSelect={onSelectEmoji}
      />)} */}
      <Sender
        ref={senderRef}
        sendMessage={handlerSendMsn}
        placeholder={senderPlaceHolder}
        disabledInput={disabledInput}
        autofocus={autofocus}
        onTextInputChange={onTextInputChange}
        buttonAlt={sendButtonAlt}
        onPressEmoji={togglePicker}
        onChangeSize={setOffset}
      />
      <AudioReactRecorder state={recordState} onStop={onStop} type={"wav"} canvasWidth={0} canvasHeight={0}/>
      <audio
          id='audio'
          controls
          src={audioData ? audioData.url : null}
        ></audio>
    </div>
  );
}

export default Conversation;