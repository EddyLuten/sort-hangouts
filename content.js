{
    let convoList = null,
        convoListObserver = null;

    const ObserveConvoList = () => {
        convoListObserver.observe(convoList, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });
    };

    // Called whenever the conversations list is modified in any way
    const OnConvoListMutation = () => {
        let list = { onlines: [], hangouts: [], offlines: [] };
        let closestWrapper = (p) => p.closest('div.c-P');
        let conversations = convoList.querySelectorAll('div.Ux.Lz');
        conversations.forEach((convo) => {
            if (convo.classList.contains('B2'))
                list.offlines.push(closestWrapper(convo));
            else if (convo.classList.contains('pD'))
                list.onlines.push(closestWrapper(convo));
            else
                list.hangouts.push(closestWrapper(convo));
        });

        list.offlines = list.offlines.sort((a, b) => {
            return a.querySelector('.mG>span')
                    .innerText
                    .toLocaleLowerCase()
                    .localeCompare(
                        b.querySelector('.mG>span')
                         .innerText
                         .toLocaleLowerCase()
                    );
        });

        convoListObserver.disconnect();
        {
            convoList.innerHTML = '';
            list.onlines.forEach((elem) => convoList.appendChild(elem));
            list.hangouts.forEach((elem) => convoList.appendChild(elem));
            list.offlines.forEach((elem) => convoList.appendChild(elem));
        }
        ObserveConvoList();
    };

    // Called when the hangouts iframe is loaded
    const OnHangoutsFrameLoaded = () => {
        convoList = document.querySelector('div[aria-label="Conversations"]');
        if (!convoList) {
            console.error('Unable to find the Hangouts conversations list.');
            return;
        }

        convoListObserver = new MutationObserver(OnConvoListMutation);
        ObserveConvoList();
    };

    // Document ready, observe until the conversations list is found
    document.addEventListener('DOMContentLoaded', () => {
        let found = false;
        let observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.classList && node.classList.contains('c-m')) {
                        OnHangoutsFrameLoaded();
                        found = true;
                        return;
                    }
                });
                if (found) return;
            });
            if (found) observer.disconnect();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });
    }, false);
}
