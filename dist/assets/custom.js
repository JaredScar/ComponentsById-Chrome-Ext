
$(document).ready(function() {
    $('.dropdown-menu a').on('click', function (event) {
        var $target = $(event.currentTarget),
            $inp = $target.find('input');
        const checkbox = event.currentTarget.children[0];

        if (checkbox.checked) {
            setTimeout(function () {
                $inp.prop('checked', false);
            }, 0);
        } else {
            setTimeout(function () {
                $inp.prop('checked', true);
            }, 0);
        }

        $(event.target).blur();
        return false;
    });
});